-- ============================================================
-- CleanReport — Initial Database Schema
-- Version: V1
-- Date: 2026-07-10
-- ============================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('REPORTER', 'ADMIN');
CREATE TYPE report_category AS ENUM ('OVERFLOW', 'ILLEGAL_DUMPING', 'BLOCKED_DRAIN');
CREATE TYPE report_status AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE report_urgency AS ENUM ('ROUTINE', 'URGENT', 'CRITICAL');
CREATE TYPE claim_status AS ENUM ('PENDING', 'APPROVED', 'COLLECTED');

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    role            user_role NOT NULL DEFAULT 'REPORTER',
    credit_balance  INTEGER NOT NULL DEFAULT 0,
    is_anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- REPORTS TABLE
-- ============================================================

CREATE TABLE reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number    VARCHAR(20) NOT NULL UNIQUE,
    reporter_id         UUID NOT NULL REFERENCES users(id),
    photo_url           VARCHAR(500) NOT NULL,
    photo_after_url     VARCHAR(500),
    location            GEOMETRY(Point, 4326) NOT NULL,
    description         VARCHAR(200),
    category            report_category NOT NULL,
    status              report_status NOT NULL DEFAULT 'REPORTED',
    urgency             report_urgency NOT NULL DEFAULT 'ROUTINE',
    is_anonymous        BOOLEAN NOT NULL DEFAULT FALSE,
    area_name           VARCHAR(200),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_reference ON reports(reference_number);

-- ============================================================
-- STATUS HISTORY TABLE
-- ============================================================

CREATE TABLE status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id       UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    changed_by      UUID NOT NULL REFERENCES users(id),
    old_status      report_status,
    new_status      report_status NOT NULL,
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_report ON status_history(report_id);
CREATE INDEX idx_status_history_created ON status_history(created_at DESC);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id       UUID REFERENCES reports(id) ON DELETE SET NULL,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================================

CREATE TABLE credit_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id       UUID REFERENCES reports(id) ON DELETE SET NULL,
    amount          INTEGER NOT NULL,
    reason          VARCHAR(200) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);

-- ============================================================
-- REWARDS TABLE
-- ============================================================

CREATE TABLE rewards (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    credits_required    INTEGER NOT NULL,
    quantity_available  INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    image_url           VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REWARD CLAIMS TABLE
-- ============================================================

CREATE TABLE reward_claims (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id       UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    status          claim_status NOT NULL DEFAULT 'PENDING',
    claimed_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_at     TIMESTAMP WITH TIME ZONE,
    collected_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reward_claims_user ON reward_claims(user_id);
CREATE INDEX idx_reward_claims_status ON reward_claims(status);
