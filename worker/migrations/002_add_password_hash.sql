-- Migration: Add password_hash column to users table
-- Date: 2026-03-12

-- Add password_hash column
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Update existing users to have null password_hash (they'll need to set password on next login)
-- This is a safe operation as existing users can still use LinkedIn OAuth

-- Note: After this migration, new registrations will require phone + password
-- Existing users can:
-- 1. Continue using LinkedIn OAuth if they have linkedin_id
-- 2. Set a password via "Forgot Password" flow using their phone number
