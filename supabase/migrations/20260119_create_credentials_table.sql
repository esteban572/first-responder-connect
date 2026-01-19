-- Credential Vault Migration
-- Run this in Supabase SQL Editor

-- Main credentials table
CREATE TABLE credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credential_type VARCHAR(50) NOT NULL,
  credential_name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255),
  issue_date DATE,
  expiration_date DATE,
  credential_number VARCHAR(100),
  document_url TEXT,
  document_path TEXT,
  notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired')),
  notification_days INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credentials_user_id ON credentials(user_id);
CREATE INDEX idx_credentials_expiration_date ON credentials(expiration_date);
CREATE INDEX idx_credentials_status ON credentials(status);

-- RLS Policies
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Users can view their own credentials
CREATE POLICY "Users can view own credentials" ON credentials
  FOR SELECT USING (auth.uid() = user_id);

-- Public credentials viewable by anyone (for showcase)
CREATE POLICY "Public credentials viewable by anyone" ON credentials
  FOR SELECT USING (is_public = true AND status = 'valid');

-- Users can insert own credentials
CREATE POLICY "Users can insert own credentials" ON credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own credentials
CREATE POLICY "Users can update own credentials" ON credentials
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own credentials
CREATE POLICY "Users can delete own credentials" ON credentials
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update credential status based on expiration
CREATE OR REPLACE FUNCTION update_credential_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date IS NOT NULL THEN
    IF NEW.expiration_date < CURRENT_DATE THEN
      NEW.status = 'expired';
    ELSIF NEW.expiration_date <= CURRENT_DATE + (NEW.notification_days || ' days')::INTERVAL THEN
      NEW.status = 'expiring_soon';
    ELSE
      NEW.status = 'valid';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update status on insert/update
CREATE TRIGGER trigger_update_credential_status
  BEFORE INSERT OR UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_credential_status();

-- Note: Create a storage bucket named 'credentials' in Supabase Dashboard
-- with public access for document storage
