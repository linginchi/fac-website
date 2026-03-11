-- FAC Platform V5.1 - Cloudflare D1 Database Schema
-- 核心特性：Party A/B 身份系统、原子化能力矩阵、30% 订金托管、隐私授权机制

-- ============================================
-- 用户表 (Users)
-- ============================================
CREATE TABLE users (
    id TEXT PRIMARY KEY,                          -- 用户唯一标识
    email TEXT UNIQUE,                            -- 邮箱
    display_name TEXT,                            -- 显示名称
    bio TEXT,                                     -- 个人简介
    
    -- 身份状态
    current_role TEXT CHECK (current_role IN ('A', 'B', 'neutral')) DEFAULT 'neutral',
    
    -- 会员等级 (简化：basic / verified)
    membership_tier TEXT CHECK (membership_tier IN ('basic', 'verified')) DEFAULT 'basic',
    
    -- 隐私设置
    vault_visibility TEXT CHECK (vault_visibility IN ('private', 'partial', 'public')) DEFAULT 'private',
    
    -- LinkedIn 数据
    linkedin_id TEXT,
    linkedin_profile_url TEXT,
    linkedin_headline TEXT,
    linkedin_synced_at TEXT,                      -- ISO 8601 格式
    
    -- 时间戳
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- 能力矩阵表 (Skill Matrix)
-- 原子化能力标签，支持跨领域能力调度
-- ============================================
CREATE TABLE skill_tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,                          -- 能力标签名称
    weight INTEGER CHECK (weight >= 0 AND weight <= 100),  -- AI 权重建议
    category TEXT CHECK (category IN (
        'legal', 'finance', 'trade', 'tech', 'language',
        'management', 'education', 'healthcare', 'creative', 'other'
    )),
    verified BOOLEAN DEFAULT FALSE,               -- 验证状态
    source TEXT CHECK (source IN ('linkedin', 'manual', 'ai-extracted')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 能力标签索引，用于快速匹配
CREATE INDEX idx_skill_tags_user ON skill_tags(user_id);
CREATE INDEX idx_skill_tags_category ON skill_tags(category);
CREATE INDEX idx_skill_tags_label ON skill_tags(label);

-- ============================================
-- 隐私授权表 (Privacy Authorizations)
-- 乙方主动授权隐私给甲方
-- ============================================
CREATE TABLE privacy_authorizations (
    id TEXT PRIMARY KEY,
    grantor_id TEXT NOT NULL,                     -- 授权方 (乙方)
    grantee_id TEXT NOT NULL,                     -- 被授权方 (甲方)
    scope TEXT NOT NULL,                          -- JSON 数组: ["phone", "email", "wechat"]
    authorized_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,                     -- 授权过期时间
    revoked_at TEXT,                              -- 撤销时间
    
    FOREIGN KEY (grantor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grantee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_privacy_grantor ON privacy_authorizations(grantor_id);
CREATE INDEX idx_privacy_grantee ON privacy_authorizations(grantee_id);

-- ============================================
-- 任务/委托表 (Tasks)
-- Smart Escrow 30% 订金托管
-- ============================================
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    
    -- 甲方信息
    party_a_id TEXT NOT NULL,
    party_a_masked_name TEXT NOT NULL,            -- 脱敏显示名称
    
    -- 乙方信息 (匹配后填充)
    party_b_id TEXT,
    party_b_masked_name TEXT,
    
    -- 任务内容
    title TEXT NOT NULL,
    description TEXT,
    required_skills TEXT,                         -- JSON 数组
    
    -- 财务信息 (HKD)
    total_amount INTEGER NOT NULL,                -- 总报酬
    deposit_amount INTEGER NOT NULL,              -- 30% 订金
    platform_fee INTEGER DEFAULT 50,              -- 平台维护费 (固定)
    
    -- 状态
    status TEXT CHECK (status IN (
        'draft', 'published', 'matched', 'deposit_locked',
        'in_progress', 'delivered', 'completed', 'disputed', 'cancelled'
    )) DEFAULT 'draft',
    
    -- 时间戳
    created_at TEXT DEFAULT (datetime('now')),
    published_at TEXT,
    deposit_locked_at TEXT,
    started_at TEXT,
    delivered_at TEXT,
    completed_at TEXT,
    
    -- 交付内容
    deliverables TEXT,                            -- JSON 数组，文件 URL 列表
    
    -- 评价
    party_a_rating INTEGER CHECK (party_a_rating >= 1 AND party_a_rating <= 5),
    party_b_rating INTEGER CHECK (party_b_rating >= 1 AND party_b_rating <= 5),
    party_a_review TEXT,
    party_b_review TEXT,
    
    FOREIGN KEY (party_a_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (party_b_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_party_a ON tasks(party_a_id);
CREATE INDEX idx_tasks_party_b ON tasks(party_b_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- 交易记录表 (Transactions)
-- $FAC 代币流水
-- ============================================
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT,                                 -- 关联任务 (可选)
    type TEXT CHECK (type IN (
        'deposit', 'payment', 'refund', 'reward', 'withdrawal'
    )),
    amount INTEGER NOT NULL,                      -- 正值 = 收入，负值 = 支出
    currency TEXT CHECK (currency IN ('FAC', 'HKD')) DEFAULT 'FAC',
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_user ON transactions(user_id);

-- ============================================
-- 联系信息表 (Contact Info)
-- 预脱敏存储，API 返回时已脱敏
-- ============================================
CREATE TABLE contact_info (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    
    -- 真实信息 (严格加密，仅用于展示给已授权方)
    phone_real TEXT,
    email_real TEXT,
    wechat_real TEXT,
    
    -- 脱敏显示 (API 默认返回此字段)
    phone_masked TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN phone_real IS NULL THEN NULL
            WHEN LENGTH(phone_real) >= 4 THEN 
                SUBSTR(phone_real, 1, LENGTH(phone_real) - 4) || '****'
            ELSE '****'
        END
    ) STORED,
    email_masked TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN email_real IS NULL THEN NULL
            ELSE 
                SUBSTR(email_real, 1, 1) || '***@' || 
                SUBSTR(email_real, INSTR(email_real, '@') + 1)
        END
    ) STORED,
    wechat_masked TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN wechat_real IS NULL THEN NULL
            ELSE 'wxid_****'
        END
    ) STORED,
    
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_skill_tags_timestamp 
AFTER UPDATE ON skill_tags
BEGIN
    UPDATE skill_tags SET updated_at = datetime('now') WHERE id = NEW.id;
END;
