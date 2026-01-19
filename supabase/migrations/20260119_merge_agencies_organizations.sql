-- Merge Agencies and Organizations
-- Organizations now function as agencies with review capabilities

-- 1. Add agency-specific fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS agency_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_area VARCHAR(50),
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS employee_count VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations(state);
CREATE INDEX IF NOT EXISTS idx_organizations_agency_type ON organizations(agency_type);
CREATE INDEX IF NOT EXISTS idx_organizations_service_area ON organizations(service_area);
CREATE INDEX IF NOT EXISTS idx_organizations_is_public ON organizations(is_public);

-- 3. Create organization_reviews table (replaces or supplements agency_reviews)
CREATE TABLE IF NOT EXISTS organization_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_culture INTEGER CHECK (rating_culture >= 1 AND rating_culture <= 5),
  rating_compensation INTEGER CHECK (rating_compensation >= 1 AND rating_compensation <= 5),
  rating_worklife INTEGER CHECK (rating_worklife >= 1 AND rating_worklife <= 5),
  rating_equipment INTEGER CHECK (rating_equipment >= 1 AND rating_equipment <= 5),
  rating_training INTEGER CHECK (rating_training >= 1 AND rating_training <= 5),
  rating_management INTEGER CHECK (rating_management >= 1 AND rating_management <= 5),
  title VARCHAR(255),
  pros TEXT,
  cons TEXT,
  review_text TEXT,
  advice_to_management TEXT,
  employment_status VARCHAR(20) CHECK (employment_status IN ('current', 'former')),
  job_title VARCHAR(100),
  years_at_agency VARCHAR(20),
  would_recommend BOOLEAN,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id) -- One review per user per org
);

-- 4. Create helpful votes table for organization reviews
CREATE TABLE IF NOT EXISTS organization_review_helpful (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES organization_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- 5. Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_org_reviews_organization ON organization_reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_reviews_user ON organization_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_org_reviews_rating ON organization_reviews(rating_overall);
CREATE INDEX IF NOT EXISTS idx_org_reviews_approved ON organization_reviews(is_approved);

-- 6. Enable RLS
ALTER TABLE organization_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_review_helpful ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for organization_reviews
-- Anyone can view approved reviews (anonymous display)
CREATE POLICY "Anyone can view approved reviews" ON organization_reviews
FOR SELECT USING (is_approved = true);

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews" ON organization_reviews
FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews" ON organization_reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON organization_reviews
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON organization_reviews
FOR DELETE USING (auth.uid() = user_id);

-- 8. RLS Policies for helpful votes
CREATE POLICY "Anyone can view helpful votes" ON organization_review_helpful
FOR SELECT USING (true);

CREATE POLICY "Users can add helpful votes" ON organization_review_helpful
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own helpful votes" ON organization_review_helpful
FOR DELETE USING (auth.uid() = user_id);

-- 9. Helper function to update helpful count
CREATE OR REPLACE FUNCTION update_org_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organization_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organization_reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_org_review_helpful_count ON organization_review_helpful;
CREATE TRIGGER trigger_update_org_review_helpful_count
  AFTER INSERT OR DELETE ON organization_review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_org_review_helpful_count();

-- 11. View for organizations with review stats
CREATE OR REPLACE VIEW organizations_with_stats AS
SELECT
  o.*,
  COALESCE(r.review_count, 0) as review_count,
  r.avg_overall,
  r.avg_culture,
  r.avg_compensation,
  r.avg_worklife,
  r.avg_equipment,
  r.avg_training,
  r.avg_management,
  r.recommend_percent
FROM organizations o
LEFT JOIN (
  SELECT
    organization_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating_overall)::numeric, 1) as avg_overall,
    ROUND(AVG(rating_culture)::numeric, 1) as avg_culture,
    ROUND(AVG(rating_compensation)::numeric, 1) as avg_compensation,
    ROUND(AVG(rating_worklife)::numeric, 1) as avg_worklife,
    ROUND(AVG(rating_equipment)::numeric, 1) as avg_equipment,
    ROUND(AVG(rating_training)::numeric, 1) as avg_training,
    ROUND(AVG(rating_management)::numeric, 1) as avg_management,
    ROUND(AVG(CASE WHEN would_recommend THEN 100 ELSE 0 END)::numeric, 0) as recommend_percent
  FROM organization_reviews
  WHERE is_approved = true
  GROUP BY organization_id
) r ON o.id = r.organization_id
WHERE o.is_public = true;

-- 12. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE organization_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_review_helpful;
