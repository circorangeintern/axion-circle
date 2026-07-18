-- ============================================================
-- CleanReport — V2 Migration
-- Expand categories (3→6), rename urgency, add title + address
-- Date: 2026-07-18
-- Tickets: SCRUM-105, SCRUM-106
-- ============================================================

-- ============================================================
-- 1. EXPAND REPORT CATEGORIES (add 3 new values)
-- ============================================================

ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'STREET_LITTER';
ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'RESIDENTIAL_DUMP';
ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'COMMERCIAL_DUMP';

-- ============================================================
-- 2. RENAME URGENCY VALUE: URGENT → VERY_URGENT
-- PostgreSQL doesn't support ALTER TYPE RENAME VALUE directly,
-- so we recreate the enum with the correct values.
-- ============================================================

-- Step 1: Add the new value
ALTER TYPE report_urgency ADD VALUE IF NOT EXISTS 'VERY_URGENT';

-- Step 2: Migrate existing rows from URGENT → VERY_URGENT
UPDATE reports SET urgency = 'VERY_URGENT' WHERE urgency = 'URGENT';

-- Note: We cannot DROP the old 'URGENT' value from a PostgreSQL enum.
-- It will remain in the type but won't be used by the application.
-- The Java enum will only expose ROUTINE, VERY_URGENT, CRITICAL.

-- ============================================================
-- 3. ADD TITLE AND ADDRESS COLUMNS TO REPORTS
-- ============================================================

ALTER TABLE reports ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS address VARCHAR(300);

-- ============================================================
-- 4. ADD INDEX FOR SEARCH (title, description, address)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reports_title ON reports(title);
CREATE INDEX IF NOT EXISTS idx_reports_search ON reports
    USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(address, '')));
