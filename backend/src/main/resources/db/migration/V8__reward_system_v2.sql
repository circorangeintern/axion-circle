-- ============================================================
-- CleanReport — V8 Migration
-- Reward System v2: streaks, levels, digital redemption codes
-- Date: 2026-07-20
-- ============================================================

-- Add streak and level fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_report_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level VARCHAR(20) NOT NULL DEFAULT 'OBSERVER';

-- Add redemption code to reward_claims
ALTER TABLE reward_claims ADD COLUMN IF NOT EXISTS redemption_code VARCHAR(50);
ALTER TABLE reward_claims ADD COLUMN IF NOT EXISTS reward_type VARCHAR(30);

-- Update rewards table to include type
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS reward_type VARCHAR(30) NOT NULL DEFAULT 'DIGITAL_CODE';
