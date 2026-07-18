-- ============================================================
-- CleanReport — V3 Migration
-- Add title + address columns, migrate urgency data, add search index
-- Date: 2026-07-18
-- Tickets: SCRUM-105, SCRUM-106, SCRUM-107
-- ============================================================

-- Migrate existing URGENT values to VERY_URGENT
UPDATE reports SET urgency = 'VERY_URGENT' WHERE urgency = 'URGENT';

-- Add title and address columns
ALTER TABLE reports ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS address VARCHAR(300);

-- Index for search (full-text)
CREATE INDEX IF NOT EXISTS idx_reports_title ON reports(title);
CREATE INDEX IF NOT EXISTS idx_reports_search ON reports
    USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(address, '')));
