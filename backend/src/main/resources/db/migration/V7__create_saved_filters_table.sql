-- ============================================================
-- CleanReport — V7 Migration
-- Create saved_filters table
-- Date: 2026-07-18
-- Ticket: SCRUM-116
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_filters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    categories      JSONB,
    urgency_levels  JSONB,
    statuses        JSONB,
    area_name       VARCHAR(200),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON saved_filters(user_id);
