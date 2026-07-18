-- ============================================================
-- CleanReport — V5 Migration
-- Add password reset fields to users table
-- Date: 2026-07-18
-- Ticket: SCRUM-111
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
