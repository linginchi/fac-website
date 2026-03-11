-- Migration: Initial Schema for FAC Platform V5.1
-- Created: 2025-03-11

-- ============================================
-- 用户表 (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    current_role TEXT CHECK (current_role IN ('A', 'B', 'neutral')) DEFAULT 'neutral',
    membership_tier TEXT CHECK (membership_tier IN ('basic', 'verified')) DEFAULT 'basic',
    vault_visibility TEXT CHECK (vault_visibility IN ('private', 'partial', 'public')) DEFAULT 'private',
    linkedin_id TEXT,
    linkedin_profile_url TEXT,
    linkedin_headline TEXT,
    linkedin_synced_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- 能力矩阵表 (Skill Matrix)
-- ============================================
CREATE TABLE IF NOT EXISTS skill_tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    weight INTEGER CHECK (weight >= 0 AND weight <= 100),
    category TEXT CHECK (category IN (
        'legal', 'finance', 'trade', 'tech', 'language',
        'management', 'education', 'healthcare', 'creative', 'other'
    )),
    verified BOOLEAN DEFAULT FALSE,
    source TEXT CHECK (source IN ('linkedin', 'manual', 'ai-extracted')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_skill_tags_user ON skill_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_tags_category ON skill_tags(category);
CREATE INDEX IF NOT EXISTS idx_skill_tags_label ON skill_tags(label);

-- ============================================
-- 隐私授权表 (Privacy Authorizations)
-- ============================================
CREATE TABLE IF NOT EXISTS privacy_authorizations (
    id TEXT PRIMARY KEY,
    grantor_id TEXT NOT NULL,
    grantee_id TEXT NOT NULL,
    scope TEXT NOT NULL,
    authorized_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    FOREIGN KEY (grantor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grantee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_privacy_grantor ON privacy_authorizations(grantor_id);
CREATE INDEX IF NOT EXISTS idx_privacy_grantee ON privacy_authorizations(grantee_id);

-- ============================================
-- 任务/委托表 (Tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    party_a_id TEXT NOT NULL,
    party_a_masked_name TEXT NOT NULL,
    party_b_id TEXT,
    party_b_masked_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    required_skills TEXT,
    total_amount INTEGER NOT NULL,
    deposit_amount INTEGER NOT NULL,
    platform_fee INTEGER DEFAULT 50,
    status TEXT CHECK (status IN (
        'draft', 'published', 'matched', 'deposit_locked',
        'in_progress', 'delivered', 'completed', 'disputed', 'cancelled'
    )) DEFAULT 'draft',
    created_at TEXT DEFAULT (datetime('now')),
    published_at TEXT,
    deposit_locked_at TEXT,
    started_at TEXT,
    delivered_at TEXT,
    completed_at TEXT,
    deliverables TEXT,
    party_a_rating INTEGER CHECK (party_a_rating >= 1 AND party_a_rating <= 5),
    party_b_rating INTEGER CHECK (party_b_rating >= 1 AND party_b_rating <= 5),
    party_a_review TEXT,
    party_b_review TEXT,
    FOREIGN KEY (party_a_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (party_b_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_party_a ON tasks(party_a_id);
CREATE INDEX IF NOT EXISTS idx_tasks_party_b ON tasks(party_b_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================
-- 交易记录表 (Transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT,
    type TEXT CHECK (type IN ('deposit', 'payment', 'refund', 'reward', 'withdrawal')),
    amount INTEGER NOT NULL,
    currency TEXT CHECK (currency IN ('FAC', 'HKD')) DEFAULT 'FAC',
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- ============================================
-- 联系信息表 (Contact Info)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_info (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    phone_real TEXT,
    email_real TEXT,
    wechat_real TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_skill_tags_timestamp 
AFTER UPDATE ON skill_tags
BEGIN
    UPDATE skill_tags SET updated_at = datetime('now') WHERE id = NEW.id;
END;
