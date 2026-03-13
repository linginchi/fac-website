// Database utilities for D1
import type { D1Database } from '@cloudflare/workers-types';
import type { User, FacTransaction, Referral, UserSkill, BuybackRecord } from '../types';

export class Database {
  constructor(private db: D1Database) {}
  
  // User operations
  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();
    return result;
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();
    return result;
  }
  
  async getUserByLinkedInId(linkedinId: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE linkedin_id = ?')
      .bind(linkedinId)
      .first<User>();
    return result;
  }
  
  async getUserByReferralCode(code: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE referral_code = ?')
      .bind(code)
      .first<User>();
    return result;
  }
  
  async getUserByPhone(phone: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE phone = ?')
      .bind(phone)
      .first<User>();
    return result;
  }
  
  async createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<void> {
    const now = new Date().toISOString();
    await this.db.prepare(`
      INSERT INTO users (
        id, email, display_name, avatar_url, linkedin_id, linkedin_profile_url,
        linkedin_headline, linkedin_synced_at, user_role, membership_tier,
        membership_expires_at, phone, password_hash, location, bio, hourly_rate, years_experience,
        availability, company_name, company_size, industry, cv_url, wallet_address,
        wallet_created_at, referral_code, referred_by, fac_balance, fac_lifetime_earned,
        fac_lifetime_spent, created_at, updated_at, last_login_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id, user.email, user.display_name, user.avatar_url, user.linkedin_id,
      user.linkedin_profile_url, user.linkedin_headline, user.linkedin_synced_at,
      user.user_role, user.membership_tier, user.membership_expires_at, user.phone, user.password_hash,
      user.location, user.bio, user.hourly_rate, user.years_experience, user.availability,
      user.company_name, user.company_size, user.industry, user.cv_url, user.wallet_address,
      user.wallet_created_at, user.referral_code, user.referred_by, user.fac_balance,
      user.fac_lifetime_earned, user.fac_lifetime_spent, now, now, null
    ).run();
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const fields = Object.keys(updates).filter(k => k !== 'id');
    if (fields.length === 0) return;
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f as keyof User]);
    
    await this.db.prepare(`
      UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?
    `).bind(...values, new Date().toISOString(), id).run();
  }
  
  async updateUserBalance(userId: string, newBalance: number, lifetimeEarned?: number, lifetimeSpent?: number): Promise<void> {
    const updates: Record<string, number> = { fac_balance: newBalance };
    if (lifetimeEarned !== undefined) updates.fac_lifetime_earned = lifetimeEarned;
    if (lifetimeSpent !== undefined) updates.fac_lifetime_spent = lifetimeSpent;
    
    await this.updateUser(userId, updates as Partial<User>);
  }
  
  // Transaction operations
  async createTransaction(transaction: Omit<FacTransaction, 'created_at'>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO fac_transactions (id, user_id, type, amount, balance_after, description, related_user_id, related_task_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      transaction.id, transaction.user_id, transaction.type, transaction.amount,
      transaction.balance_after, transaction.description, transaction.related_user_id,
      transaction.related_task_id, transaction.metadata, new Date().toISOString()
    ).run();
  }
  
  async getUserTransactions(userId: string, limit: number = 50): Promise<FacTransaction[]> {
    const result = await this.db.prepare(`
      SELECT * FROM fac_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
    `).bind(userId, limit).all<FacTransaction>();
    return result.results || [];
  }
  
  // Referral operations
  async createReferral(referral: Omit<Referral, 'created_at'>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO referrals (id, referrer_id, referee_id, referral_code, channel, status, reward_amount, created_at, completed_at, tier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      referral.id, referral.referrer_id, referral.referee_id, referral.referral_code,
      referral.channel, referral.status, referral.reward_amount, new Date().toISOString(),
      referral.completed_at, referral.tier
    ).run();
  }
  
  async completeReferral(refereeId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE referrals SET status = 'completed', completed_at = ? WHERE referee_id = ?
    `).bind(new Date().toISOString(), refereeId).run();
  }
  
  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    const result = await this.db.prepare(`
      SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC
    `).bind(referrerId).all<Referral>();
    return result.results || [];
  }
  
  async getReferralStats(referrerId: string): Promise<{ total: number; completed: number; pending: number }> {
    const result = await this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM referrals WHERE referrer_id = ?
    `).bind(referrerId).first<{ total: number; completed: number; pending: number }>();
    return result || { total: 0, completed: 0, pending: 0 };
  }
  
  // Skills operations
  async addUserSkill(skill: Omit<UserSkill, 'created_at'>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO user_skills (id, user_id, skill_label, skill_category, weight, verified, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(skill.id, skill.user_id, skill.skill_label, skill.skill_category, skill.weight, skill.verified, skill.source, new Date().toISOString()).run();
  }
  
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const result = await this.db.prepare(`
      SELECT * FROM user_skills WHERE user_id = ? ORDER BY weight DESC
    `).bind(userId).all<UserSkill>();
    return result.results || [];
  }
  
  async removeUserSkill(skillId: string): Promise<void> {
    await this.db.prepare(`
      DELETE FROM user_skills WHERE id = ?
    `).bind(skillId).run();
  }
  
  // Buyback operations
  async getBuybackHistory(): Promise<BuybackRecord[]> {
    const result = await this.db.prepare(`
      SELECT * FROM buyback_records ORDER BY created_at DESC
    `).all<BuybackRecord>();
    return result.results || [];
  }
  
  async getLatestBuyback(): Promise<BuybackRecord | null> {
    return await this.db.prepare(`
      SELECT * FROM buyback_records WHERE status = 'executed' ORDER BY executed_at DESC LIMIT 1
    `).first<BuybackRecord>();
  }
}
