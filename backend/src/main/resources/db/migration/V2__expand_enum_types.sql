-- ============================================================
-- CleanReport — V2 Migration (NON-TRANSACTIONAL)
-- Expand enum types: add new category and urgency values
-- NOTE: ALTER TYPE ADD VALUE cannot run inside a transaction in PostgreSQL
-- Date: 2026-07-18
-- Tickets: SCRUM-105
-- ============================================================

-- Flyway: this migration must be non-transactional
-- @formatter:off

ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'STREET_LITTER';
ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'RESIDENTIAL_DUMP';
ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'COMMERCIAL_DUMP';

ALTER TYPE report_urgency ADD VALUE IF NOT EXISTS 'VERY_URGENT';
