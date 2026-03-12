// FAC Platform V5.1 - TypeScript Types for Cloudflare Workers

export interface Env {
  DB: D1Database;
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
  LINKEDIN_REDIRECT_URI: string;
  JWT_SECRET_KEY: string;
  ENCRYPTION_KEY: string;
  FAC_TOKEN_ISSUER: string;
  FAC_TOKEN_AUDIENCE: string;
  // AI Model API Keys
  QWEN_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  DOUBAO_API_KEY?: string;
  DOUBAO_ENDPOINT_ID?: string;
}

// User types
export type UserRole = 'A' | 'B' | 'neutral';
export type MembershipTier = 'basic' | 'professional' | 'executive';
export type ReferralStatus = 'pending' | 'completed' | 'expired';
export type TransactionType = 
  | 'reward_linkedin_auth'
  | 'reward_linkedin_sync'
  | 'reward_profile_complete'
  | 'reward_voice_input'
  | 'reward_feedback'
  | 'reward_referral'
  | 'reward_content'
  | 'consume_basic_decode'
  | 'consume_deep_decode'
  | 'consume_private_chat'
  | 'revenue_share';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  linkedin_id: string | null;
  linkedin_profile_url: string | null;
  linkedin_headline: string | null;
  linkedin_synced_at: string | null;
  user_role: UserRole;
  membership_tier: MembershipTier;
  membership_expires_at: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
  availability: string | null;
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  cv_url: string | null;
  wallet_address: string | null;
  wallet_created_at: string | null;
  referral_code: string | null;
  referred_by: string | null;
  fac_balance: number;
  fac_lifetime_earned: number;
  fac_lifetime_spent: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface FacTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string | null;
  related_user_id: string | null;
  related_task_id: string | null;
  metadata: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  channel: string;
  status: ReferralStatus;
  reward_amount: number;
  created_at: string;
  completed_at: string | null;
  tier: 'direct' | 'indirect';
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_label: string;
  skill_category: string;
  weight: number;
  verified: boolean;
  source: 'linkedin' | 'manual' | 'ai-extracted';
  created_at: string;
}

export interface BuybackRecord {
  id: string;
  quarter: string;
  total_revenue: number;
  buyback_pool: number;
  fac_price: number;
  total_buyback: number;
  total_burned: number;
  status: 'pending' | 'executing' | 'executed';
  executed_at: string | null;
  tx_hash: string | null;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// JWT Payload
export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  tier: MembershipTier;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// LinkedIn OAuth types
export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
}

export interface LinkedInProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}
