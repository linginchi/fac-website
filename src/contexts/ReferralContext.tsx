/**
 * FAC Platform V5.1 - 推荐系统 Context
 * 管理推荐链接、QR Code、奖励发放
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { 
  ReferralRecord, 
  ReferralStats, 
  ReferralChannel,
  ContentType 
} from '../types/economy';
import { 
  REFERRAL_CONFIG, 
  CONTENT_REWARD_CONFIG,
  PLACEMENT_REWARD_CONFIG,
  TIER_MULTIPLIERS 
} from '../types/economy';
import type { MembershipTier } from '../types/user';
import { useFac } from './FacContext';

// ==================== Constants ====================

const REFERRAL_STORAGE_KEY = 'fac_referral_records_v51';
const REFERRAL_STATS_KEY = 'fac_referral_stats_v51';
const USER_REFERRAL_CODE_KEY = 'fac_user_referral_code_v51';

// ==================== Types ====================

interface ReferralContextValue {
  // 推荐码
  myReferralCode: string;
  referralLink: string;
  qrCodeData: string;
  
  // 推荐记录
  referrals: ReferralRecord[];
  stats: ReferralStats;
  
  // 核心操作
  generateReferralCode: () => string;
  trackReferral: (code: string, channel: ReferralChannel) => boolean;
  completeReferral: (refereeId: string) => void;
  
  // 奖励发放
  rewardContentCreation: (type: ContentType, quality: number, tier: MembershipTier) => void;
  rewardPlacementSuccess: (role: 'client' | 'expert', tier: MembershipTier) => void;
  
  // 统计
  getReferralTree: () => ReferralRecord[];
  getNetworkEarnings: () => number;
}

// ==================== Helper Functions ====================

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FAC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function loadReferralsFromStorage(): ReferralRecord[] {
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadStatsFromStorage(): ReferralStats {
  try {
    const stored = localStorage.getItem(REFERRAL_STATS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
    indirectEarned: 0,
    networkDepth: 0,
  };
}

function loadMyReferralCode(): string {
  try {
    const stored = localStorage.getItem(USER_REFERRAL_CODE_KEY);
    if (stored) return stored;
  } catch {}
  const newCode = generateReferralCode();
  localStorage.setItem(USER_REFERRAL_CODE_KEY, newCode);
  return newCode;
}

// ==================== Context ====================

const ReferralContext = createContext<ReferralContextValue | null>(null);

// ==================== Provider ====================

interface ReferralProviderProps {
  children: React.ReactNode;
  userId?: string;
  userTier?: MembershipTier;
}

export function ReferralProvider({ 
  children, 
  userId = 'anonymous',
  userTier = 'basic' 
}: ReferralProviderProps) {
  const { addReward } = useFac();
  
  const [myReferralCode, setMyReferralCode] = useState(() => loadMyReferralCode());
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => loadReferralsFromStorage());
  const [stats, setStats] = useState<ReferralStats>(() => loadStatsFromStorage());

  // 生成推荐链接
  const referralLink = `${window.location.origin}/register?ref=${myReferralCode}`;
  const qrCodeData = referralLink;

  // 持久化存储
  useEffect(() => {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  // 生成新的推荐码（如果用户想要更换）
  const regenerateReferralCode = useCallback(() => {
    const newCode = generateReferralCode();
    setMyReferralCode(newCode);
    localStorage.setItem(USER_REFERRAL_CODE_KEY, newCode);
    return newCode;
  }, []);

  // 追踪推荐（被推荐人点击链接时调用）
  const trackReferral = useCallback((code: string, channel: ReferralChannel): boolean => {
    // 检查是否是自己的推荐码
    if (code === myReferralCode) return false;
    
    // 检查是否已被推荐过
    const existing = referrals.find(r => r.refereeId === userId);
    if (existing) return false;

    const newReferral: ReferralRecord = {
      id: `ref_${Date.now()}`,
      referrerId: code, // 这里应该通过 code 查找到推荐人ID
      refereeId: userId,
      channel,
      referralCode: code,
      status: 'pending',
      rewardAmount: REFERRAL_CONFIG.directReferral.reward,
      createdAt: new Date().toISOString(),
      tier: 'direct',
    };

    setReferrals(prev => [...prev, newReferral]);
    setStats(prev => ({
      ...prev,
      totalReferrals: prev.totalReferrals + 1,
      pendingReferrals: prev.pendingReferrals + 1,
    }));

    return true;
  }, [myReferralCode, referrals, userId]);

  // 完成推荐（被推荐人完成注册）
  const completeReferral = useCallback((refereeId: string) => {
    setReferrals(prev => prev.map(ref => {
      if (ref.refereeId === refereeId && ref.status === 'pending') {
        // 发放奖励给推荐人
        const multiplier = TIER_MULTIPLIERS[userTier].referralBonus;
        const reward = Math.floor(ref.rewardAmount * multiplier);
        
        addReward('reward_referral', `推荐奖励: ${refereeId}`, ref.id);
        
        // 更新统计
        setStats(s => ({
          ...s,
          completedReferrals: s.completedReferrals + 1,
          pendingReferrals: s.pendingReferrals - 1,
          totalEarned: s.totalEarned + reward,
        }));

        return { ...ref, status: 'completed', completedAt: new Date().toISOString() };
      }
      return ref;
    }));
  }, [addReward, userTier]);

  // 内容创作奖励
  const rewardContentCreation = useCallback((
    type: ContentType, 
    quality: number,
    tier: MembershipTier
  ) => {
    const config = CONTENT_REWARD_CONFIG[type];
    const multiplier = TIER_MULTIPLIERS[tier].contentBonus;
    
    // 基础奖励 × 质量系数 × 等级加成
    let reward = Math.floor(
      config.baseReward * config.qualityMultiplier * multiplier * (quality / 100)
    );

    // 验证通过额外奖励
    if (quality >= 90) {
      reward += config.verificationBonus;
    }

    const descriptions: Record<ContentType, string> = {
      job_post: '发布需求奖励',
      expert_profile: '完善专家资料奖励',
      review: '评价奖励',
      feedback: '平台建议奖励',
    };

    addReward('reward_profile_complete', descriptions[type]);
  }, [addReward]);

  // 招聘成功奖励
  const rewardPlacementSuccess = useCallback((
    role: 'client' | 'expert',
    tier: MembershipTier
  ) => {
    const config = role === 'client' 
      ? PLACEMENT_REWARD_CONFIG.clientSuccess 
      : PLACEMENT_REWARD_CONFIG.expertSuccess;
    
    const multiplier = TIER_MULTIPLIERS[tier].referralBonus;
    const reward = Math.floor(config.reward * multiplier);

    addReward('reward_referral', config.description);
  }, [addReward]);

  // 获取推荐树（二级分销网络）
  const getReferralTree = useCallback(() => {
    return referrals.filter(r => r.tier === 'direct');
  }, [referrals]);

  // 获取网络总收益
  const getNetworkEarnings = useCallback(() => {
    return stats.totalEarned + stats.indirectEarned;
  }, [stats]);

  const value: ReferralContextValue = {
    myReferralCode,
    referralLink,
    qrCodeData,
    referrals,
    stats,
    generateReferralCode: regenerateReferralCode,
    trackReferral,
    completeReferral,
    rewardContentCreation,
    rewardPlacementSuccess,
    getReferralTree,
    getNetworkEarnings,
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
}

// ==================== Hook ====================

export function useReferral() {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within ReferralProvider');
  }
  return context;
}
