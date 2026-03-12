/**
 * FAC Platform V5.1 - 经济模型类型定义
 * 推荐机制 + 内容贡献 + 回购系统
 */

// ==================== 推荐机制 ====================

export type ReferralChannel = 'link' | 'qrcode' | 'social' | 'email';

export interface ReferralRecord {
  id: string;
  referrerId: string; // 推荐人
  refereeId: string; // 被推荐人
  channel: ReferralChannel;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number; // $FAC 奖励数量
  createdAt: string;
  completedAt?: string;
  tier: 'direct' | 'indirect'; // 直接推荐 or 间接推荐
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  indirectEarned: number; // 二级分销收益
  networkDepth: number; // 推荐网络深度
}

// 推荐奖励配置
export const REFERRAL_CONFIG = {
  // 直接推荐奖励（被推荐人完成注册）
  directReferral: {
    reward: 100, // $FAC
    description: '成功推荐新用户注册',
  },
  // 间接推荐奖励（二级分销）
  indirectReferral: {
    reward: 30, // $FAC
    description: '被推荐人再推荐新用户',
  },
  // 被推荐人首单奖励（额外给推荐人）
  firstTransaction: {
    reward: 50, // $FAC
    description: '被推荐人完成首笔交易',
  },
  // 有效期
  expiryDays: 90,
  // 最大二级深度
  maxDepth: 2,
};

// ==================== 内容贡献奖励 ====================

export type ContentType = 'job_post' | 'expert_profile' | 'review' | 'feedback';

export interface ContentReward {
  type: ContentType;
  baseReward: number;
  qualityMultiplier: number; // 质量系数
  verificationBonus: number; // 验证通过奖励
}

// 内容贡献奖励配置
export const CONTENT_REWARD_CONFIG: Record<ContentType, ContentReward> = {
  job_post: {
    type: 'job_post',
    baseReward: 50, // 发布需求基础奖励
    qualityMultiplier: 1.5, // 高质量需求 1.5x
    verificationBonus: 100, // 验证为真实需求额外奖励
  },
  expert_profile: {
    type: 'expert_profile',
    baseReward: 80, // 完善专家资料
    qualityMultiplier: 2, // 详细资料 2x
    verificationBonus: 150, //  LinkedIn 验证额外奖励
  },
  review: {
    type: 'review',
    baseReward: 20, // 评价
    qualityMultiplier: 1.2, // 详细评价 1.2x
    verificationBonus: 0,
  },
  feedback: {
    type: 'feedback',
    baseReward: 30, // 平台建议
    qualityMultiplier: 1,
    verificationBonus: 50, // 建议被采纳
  },
};

// 招聘成功奖励
export const PLACEMENT_REWARD_CONFIG = {
  // 甲方成功招聘到乙方
  clientSuccess: {
    reward: 200,
    description: '成功匹配并完成任务',
  },
  // 乙方成功接单
  expertSuccess: {
    reward: 200,
    description: '成功接单并完成任务',
  },
  // 平台撮合奖励（给双方）
  platformMatch: {
    reward: 100,
    description: '平台智能匹配成功',
  },
};

// ==================== 回购机制 ====================

export interface BuybackRecord {
  id: string;
  quarter: string; // 2025-Q1
  totalRevenue: number; // 平台收入（HKD）
  buybackPool: number; // 回购池金额（HKD）
  facPrice: number; // 回购价格（HKD/$FAC）
  totalBurned: number; // 销毁数量
  totalBuyback: number; // 回购数量
  executedAt: string;
  txHash?: string; // 区块链交易哈希（公开可查）
  status: 'pending' | 'executed';
}

// 回购配置
export const BUYBACK_CONFIG = {
  // 平台收入用于回购的比例
  revenuePercentage: 0.3, // 30% 收入用于回购
  // 回购资金来源
  sources: {
    platformFees: 0.4, // 40% 来自平台手续费
    membershipFees: 0.35, // 35% 来自会员费
    escrowInterest: 0.25, // 25% 来自托管利息
  },
  // 回购价格计算
  pricing: {
    basePrice: 0.1, // 基础价格 HKD 0.1 / $FAC
    volatilityCap: 0.2, // 价格波动上限 20%
  },
  // 回购执行周期
  frequency: 'quarterly', // 每季度
  // 公开透明度
  transparency: {
    publishFinancials: true, // 公布财务报表
    onchainVerification: true, // 链上验证
    realTimeDashboard: true, // 实时仪表板
  },
};

// ==================== 积分经济模型 ====================

export interface EconomyMetrics {
  totalSupply: number; // $FAC 总供应量
  circulatingSupply: number; // 流通量
  burnedSupply: number; // 已销毁量
  buybackReserve: number; // 回购储备金（HKD）
  quarterlyRevenue: number; // 季度收入（HKD）
  activeUsers: number; // 活跃用户
  transactionVolume: number; // 交易量
}

// 积分使用限制（非流通，仅限平台内）
export const FAC_LIMITS = {
  transferable: false, // 不可转账
  withdrawable: false, // 不可提现
  usableOnlyOnPlatform: true, // 仅限平台内使用
  expiration: 365, // 365天有效期（激励活跃）
};

// ==================== 用户等级与加成 ====================

export interface UserMultiplier {
  tier: 'basic' | 'professional' | 'executive';
  referralBonus: number; // 推荐加成
  contentBonus: number; // 内容奖励加成
  earlyAdopterBonus: number; // 早期用户加成
}

export const TIER_MULTIPLIERS: Record<string, UserMultiplier> = {
  basic: {
    tier: 'basic',
    referralBonus: 1,
    contentBonus: 1,
    earlyAdopterBonus: 1,
  },
  professional: {
    tier: 'professional',
    referralBonus: 1.2, // 20% 加成
    contentBonus: 1.3, // 30% 加成
    earlyAdopterBonus: 1.1,
  },
  executive: {
    tier: 'executive',
    referralBonus: 1.5, // 50% 加成
    contentBonus: 1.5, // 50% 加成
    earlyAdopterBonus: 1.2,
  },
};

// ==================== 回购透明度仪表板 ====================

export interface BuybackMetrics {
  totalSupply: number;
  circulatingSupply: number;
  burnedSupply: number;
  buybackReserve: number;
  activeUsers: number;
  lastBuybackDate: string;
}

export interface NextBuyback {
  scheduledDate: string;
  estimatedPool: number;
  projectedPrice: number;
  daysRemaining: number;
}

export interface UserBuybackHoldings {
  balance: number;
  estimatedValue: number;
  participationEligible: boolean;
  rank: string;
}

export interface TransparencyReport {
  totalRevenue: number;
  totalBuyback: number;
  totalBurned: number;
  averagePrice: number;
  lastUpdated: string;
}
