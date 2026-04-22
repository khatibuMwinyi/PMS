-- Create ProviderProfile fields for distance-weighted ranking
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_jobs INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_jobs INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS acceptance_rate FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS responsiveness FLOAT DEFAULT 0;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_provider_profiles_location ON provider_profiles (latitude, longitude);

-- Add fields to Task model for enhanced verification
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS check_in_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS pending_photo_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manual_review_reason TEXT,
ADD COLUMN IF NOT EXISTS manual_review_requested_at TIMESTAMP;

-- Create StaffTicket table
CREATE TABLE IF NOT EXISTS staff_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  assigned_to UUID,
  resolved_at TIMESTAMP,
  resolution JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for StaffTicket
CREATE INDEX IF NOT EXISTS idx_staff_tickets_status_assigned ON staff_tickets (status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tickets_priority_status ON staff_tickets (priority, status);