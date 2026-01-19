-- Gear Reviews Feature Migration
-- Community-driven reviews for medical gear and ambulance chassis

-- Gear categories enum-style table for flexibility
CREATE TABLE gear_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

-- Insert predefined categories
INSERT INTO gear_categories (id, name, description, icon, sort_order) VALUES
('monitors', 'Cardiac Monitors', 'Defibrillators, 12-leads, and monitoring equipment', 'Heart', 1),
('ventilators', 'Ventilators & Airway', 'Ventilators, CPAP, and airway management devices', 'Wind', 2),
('stretchers', 'Stretchers & Transport', 'Power stretchers, stair chairs, and transport equipment', 'Bed', 3),
('bags', 'Bags & Organizers', 'Jump bags, drug bags, and organizational systems', 'Briefcase', 4),
('diagnostic', 'Diagnostic Tools', 'Stethoscopes, BP cuffs, glucometers, thermometers', 'Activity', 5),
('ppe', 'PPE & Safety', 'Gloves, masks, eyewear, and protective equipment', 'Shield', 6),
('uniforms', 'Uniforms & Boots', 'Duty boots, pants, shirts, and station wear', 'User', 7),
('tools', 'Tools & Shears', 'Trauma shears, window punches, seatbelt cutters', 'Scissors', 8),
('lighting', 'Lighting', 'Penlights, headlamps, scene lights', 'Flashlight', 9),
('ambulance', 'Ambulance Chassis', 'Type I, II, III chassis and remount options', 'Truck', 10),
('software', 'Software & Apps', 'ePCR, protocols, reference apps', 'Smartphone', 11),
('iv', 'IV & Vascular Access', 'IV pumps, IO drills, catheters', 'Droplet', 12),
('medications', 'Medication Delivery', 'Drug boxes, med pouches, label systems', 'Pill', 13),
('communications', 'Radios & Comms', 'Portable radios, headsets, MDTs', 'Radio', 14),
('other', 'Other Equipment', 'Miscellaneous gear and equipment', 'Package', 99);

-- Main gear items table
CREATE TABLE gear_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  category_id VARCHAR(50) NOT NULL REFERENCES gear_categories(id),
  description TEXT,
  image_url TEXT,
  price_range VARCHAR(50), -- e.g., '$', '$$', '$$$', '$$$$'
  specs JSONB, -- Flexible specs storage
  website_url TEXT,
  created_by UUID REFERENCES profiles(id),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gear reviews table
CREATE TABLE gear_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gear_item_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  pros TEXT[],
  cons TEXT[],
  review_text TEXT,
  years_of_use VARCHAR(50), -- e.g., '<1 year', '1-2 years', '3-5 years', '5+ years'
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gear_item_id, user_id) -- One review per user per item
);

-- Helpful votes for gear reviews
CREATE TABLE gear_review_helpful (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES gear_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Indexes for gear tables
CREATE INDEX idx_gear_items_category ON gear_items(category_id);
CREATE INDEX idx_gear_items_brand ON gear_items(brand);
CREATE INDEX idx_gear_reviews_item ON gear_reviews(gear_item_id);
CREATE INDEX idx_gear_reviews_user ON gear_reviews(user_id);
CREATE INDEX idx_gear_reviews_rating ON gear_reviews(rating);

-- RLS Policies for gear_items
ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved gear items" ON gear_items
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can add gear items" ON gear_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own gear items" ON gear_items
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for gear_reviews
ALTER TABLE gear_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gear reviews" ON gear_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON gear_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON gear_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON gear_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for gear_review_helpful
ALTER TABLE gear_review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view helpful votes" ON gear_review_helpful
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote helpful" ON gear_review_helpful
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful vote" ON gear_review_helpful
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update gear item average rating
CREATE OR REPLACE FUNCTION update_gear_item_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update could be added to gear_items table if we add rating columns
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gear_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gear_reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR DELETE ON gear_review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();
