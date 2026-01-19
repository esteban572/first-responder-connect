-- Agency Reviews Feature Migration
-- Anonymous Glassdoor-style reviews for EMS agencies

-- Agencies table
CREATE TABLE agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  agency_type VARCHAR(50), -- 'private', 'municipal', 'fire_based', 'hospital_based', 'third_service', 'volunteer'
  service_area VARCHAR(100), -- '911', 'IFT', 'CCT', 'mixed'
  website_url TEXT,
  logo_url TEXT,
  employee_count VARCHAR(50), -- '1-50', '51-200', '201-500', '500+'
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency reviews table (anonymous)
CREATE TABLE agency_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- For verification, but not displayed

  -- Individual ratings (1-5 scale)
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_culture INTEGER CHECK (rating_culture >= 1 AND rating_culture <= 5),
  rating_compensation INTEGER CHECK (rating_compensation >= 1 AND rating_compensation <= 5),
  rating_worklife INTEGER CHECK (rating_worklife >= 1 AND rating_worklife <= 5),
  rating_equipment INTEGER CHECK (rating_equipment >= 1 AND rating_equipment <= 5),
  rating_training INTEGER CHECK (rating_training >= 1 AND rating_training <= 5),
  rating_management INTEGER CHECK (rating_management >= 1 AND rating_management <= 5),

  -- Review content
  title VARCHAR(255),
  pros TEXT,
  cons TEXT,
  review_text TEXT,
  advice_to_management TEXT,

  -- Employment details (anonymized)
  employment_status VARCHAR(50), -- 'current', 'former'
  job_title VARCHAR(100), -- 'EMT', 'Paramedic', 'Supervisor', etc.
  years_at_agency VARCHAR(50), -- '<1 year', '1-2 years', '3-5 years', '5+ years'

  -- Would recommend
  would_recommend BOOLEAN,

  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  reported_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful votes for agency reviews
CREATE TABLE agency_review_helpful (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES agency_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Indexes for agency tables
CREATE INDEX idx_agencies_state ON agencies(state);
CREATE INDEX idx_agencies_type ON agencies(agency_type);
CREATE INDEX idx_agencies_name ON agencies(name);
CREATE INDEX idx_agency_reviews_agency ON agency_reviews(agency_id);
CREATE INDEX idx_agency_reviews_overall ON agency_reviews(rating_overall);
CREATE INDEX idx_agency_reviews_approved ON agency_reviews(is_approved);

-- RLS Policies for agencies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agencies" ON agencies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add agencies" ON agencies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update agencies" ON agencies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for agency_reviews
-- IMPORTANT: Reviews are anonymous - user_id is NOT exposed in SELECT
ALTER TABLE agency_reviews ENABLE ROW LEVEL SECURITY;

-- View reviews without exposing user_id (handled in service layer)
CREATE POLICY "Anyone can view approved agency reviews" ON agency_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create agency reviews" ON agency_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own reviews
CREATE POLICY "Users can update their own agency reviews" ON agency_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agency reviews" ON agency_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for helpful votes
ALTER TABLE agency_review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view helpful votes" ON agency_review_helpful
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote helpful" ON agency_review_helpful
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful vote" ON agency_review_helpful
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_agency_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE agency_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE agency_reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agency_helpful_count
  AFTER INSERT OR DELETE ON agency_review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_review_helpful_count();

-- View for agency stats (average ratings)
CREATE OR REPLACE VIEW agency_stats AS
SELECT
  a.id,
  a.name,
  a.city,
  a.state,
  a.agency_type,
  a.service_area,
  a.logo_url,
  a.is_verified,
  COUNT(ar.id) as review_count,
  ROUND(AVG(ar.rating_overall)::numeric, 1) as avg_overall,
  ROUND(AVG(ar.rating_culture)::numeric, 1) as avg_culture,
  ROUND(AVG(ar.rating_compensation)::numeric, 1) as avg_compensation,
  ROUND(AVG(ar.rating_worklife)::numeric, 1) as avg_worklife,
  ROUND(AVG(ar.rating_equipment)::numeric, 1) as avg_equipment,
  ROUND(AVG(ar.rating_training)::numeric, 1) as avg_training,
  ROUND(AVG(ar.rating_management)::numeric, 1) as avg_management,
  ROUND(AVG(CASE WHEN ar.would_recommend THEN 1 ELSE 0 END) * 100) as recommend_percent
FROM agencies a
LEFT JOIN agency_reviews ar ON a.id = ar.agency_id AND ar.is_approved = true
GROUP BY a.id;

-- Add agency_id to jobs table for linking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id);
CREATE INDEX IF NOT EXISTS idx_jobs_agency ON jobs(agency_id);
