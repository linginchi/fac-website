-- FAC Platform V5.1 - Initial Database Schema
-- D1 Database Migration

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    linkedin_id TEXT UNIQUE,
    linkedin_profile_url TEXT,
    linkedin_headline TEXT,
    linkedin_synced_at TEXT,
    
    -- User role: 'A' = 甲方(demand), 'B' = 乙方(supply), 'neutral' = 未选择
    user_role TEXT DEFAULT 'neutral',
    
    -- Membership tier
    membership_tier TEXT DEFAULT 'basic',
    membership_expires_at TEXT,
    
    -- Profile data (JSON)
    phone TEXT,
    location TEXT,
    bio TEXT,
    hourly_rate INTEGER,
    years_experience INTEGER,
    availability TEXT, -- JSON array
    company_name TEXT,
    company_size TEXT,
    industry TEXT,
    cv_url TEXT,
    
    -- Decentralized wallet
    wallet_address TEXT UNIQUE,
    wallet_created_at TEXT,
    
    -- Referral
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    
    -- Stats
    fac_balance INTEGER DEFAULT 0,
    fac_lifetime_earned INTEGER DEFAULT 0,
    fac_lifetime_spent INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_login_at TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_linkedin_id ON users(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- $FAC Transactions table
CREATE TABLE IF NOT EXISTS fac_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'reward_linkedin_auth', 'reward_referral', 'consume_decode', etc.
    amount INTEGER NOT NULL, -- positive = credit, negative = debit
    balance_after INTEGER NOT NULL,
    description TEXT,
    related_user_id TEXT, -- for referral rewards
    related_task_id TEXT, -- for task-related transactions
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON fac_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON fac_transactions(created_at);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL, -- who invited
    referee_id TEXT NOT NULL, -- who was invited
    referral_code TEXT NOT NULL,
    channel TEXT DEFAULT 'link', -- 'link', 'qrcode', 'social', 'email'
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'expired'
    reward_amount INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    tier TEXT DEFAULT 'direct', -- 'direct' or 'indirect'
    
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referee_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_label TEXT NOT NULL,
    skill_category TEXT NOT NULL,
    weight INTEGER DEFAULT 80,
    verified BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'manual', -- 'linkedin', 'manual', 'ai-extracted'
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(skill_category);

-- Buyback records table
CREATE TABLE IF NOT EXISTS buyback_records (
    id TEXT PRIMARY KEY,
    quarter TEXT NOT NULL, -- e.g., '2025-Q1'
    total_revenue INTEGER NOT NULL, -- HKD
    buyback_pool INTEGER NOT NULL, -- HKD (30% of revenue)
    fac_price REAL NOT NULL, -- HKD per $FAC
    total_buyback INTEGER NOT NULL, -- $FAC amount
    total_burned INTEGER NOT NULL, -- $FAC amount
    status TEXT DEFAULT 'pending', -- 'pending', 'executing', 'executed'
    executed_at TEXT,
    tx_hash TEXT, -- blockchain transaction hash
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_buyback_quarter ON buyback_records(quarter);
CREATE INDEX IF NOT EXISTS idx_buyback_status ON buyback_records(status);

-- Platform configuration
CREATE TABLE IF NOT EXISTS platform_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Insert initial config
INSERT OR REPLACE INTO platform_config (key, value, updated_at) VALUES
('fac_total_supply', '1000000000', datetime('now')),
('fac_circulating_supply', '850000000', datetime('now')),
('fac_burned_supply', '0', datetime('now')),
('last_buyback_date', '', datetime('now')),
('platform_version', '5.1.0', datetime('now'));
