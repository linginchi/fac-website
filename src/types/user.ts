/**
 * FAC Platform V5.1 - User Types
 * 基于能力导向、隐私授权与非营利精神的专业服务调度平台
 */

// ==================== Skill Matrix (原子化能力矩阵) ====================

export interface SkillTag {
  id: string;
  label: string;
  /** AI 权重建议 (0-100) */
  weight: number;
  category: SkillCategory;
  verified: boolean;
  source: 'linkedin' | 'manual' | 'ai-extracted';
}

export type SkillCategory =
  | 'legal'
  | 'finance'
  | 'trade'
  | 'tech'
  | 'language'
  | 'management'
  | 'education'
  | 'healthcare'
  | 'creative'
  | 'other';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  legal: '法律合规',
  finance: '金融财务',
  trade: '跨境贸易',
  tech: '技术工程',
  language: '语言翻译',
  management: '管理咨询',
  education: '教育培训',
  healthcare: '医疗健康',
  creative: '创意设计',
  other: '其他专长',
};

// ==================== Membership Tiers (V5.1 用户分级) ====================

export type MembershipTier = 'basic' | 'professional' | 'executive';

export interface TierBenefits {
  name: string;
  monthlyFee: number;
  yearlyFee: number;
  facRewards: {
    linkedinAuth: number;
    linkedinSync: number;
    profileComplete: number;
    voiceInput: number;
    feedback: number;
  };
  facCosts: {
    basicDecode: number;
    deepDecode: number;
    privateChat: number;
  };
  features: {
    vaultAccess: boolean;
    priorityMatching: boolean;
    coldWalletExport: boolean;
    governanceVote: boolean;
    blackGoldInvite: boolean;
    revenueShare: boolean;
    decodeDiscount: number;
  };
}

export const TIER_CONFIG: Record<MembershipTier, TierBenefits> = {
  basic: {
    name: 'Basic',
    monthlyFee: 0,
    yearlyFee: 0,
    facRewards: {
      linkedinAuth: 80,
      linkedinSync: 50,
      profileComplete: 20,
      voiceInput: 50,
      feedback: 30,
    },
    facCosts: {
      basicDecode: 10,
      deepDecode: 50,
      privateChat: 100,
    },
    features: {
      vaultAccess: true,
      priorityMatching: false,
      coldWalletExport: false,
      governanceVote: false,
      blackGoldInvite: false,
      revenueShare: false,
      decodeDiscount: 0,
    },
  },
  professional: {
    name: 'Professional',
    monthlyFee: 99,
    yearlyFee: 999,
    facRewards: {
      linkedinAuth: 100,
      linkedinSync: 75,
      profileComplete: 30,
      voiceInput: 75,
      feedback: 50,
    },
    facCosts: {
      basicDecode: 8,
      deepDecode: 40,
      privateChat: 80,
    },
    features: {
      vaultAccess: true,
      priorityMatching: true,
      coldWalletExport: false,
      governanceVote: false,
      blackGoldInvite: false,
      revenueShare: false,
      decodeDiscount: 0.2,
    },
  },
  executive: {
    name: 'Executive / Partner',
    monthlyFee: 299,
    yearlyFee: 2999,
    facRewards: {
      linkedinAuth: 150,
      linkedinSync: 100,
      profileComplete: 50,
      voiceInput: 100,
      feedback: 80,
    },
    facCosts: {
      basicDecode: 5,
      deepDecode: 25,
      privateChat: 50,
    },
    features: {
      vaultAccess: true,
      priorityMatching: true,
      coldWalletExport: true,
      governanceVote: true,
      blackGoldInvite: true,
      revenueShare: true,
      decodeDiscount: 0.5,
    },
  },
};

// ==================== LinkedIn Integration ====================

export interface LinkedInExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

// ==================== User Profile ====================

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  bio?: string;
  
  // V5.1: 原子化能力矩阵
  skillMatrix: SkillTag[];
  
  // 隐私设置
  vaultVisibility: 'private' | 'partial' | 'public';
  
  // V5.1: 会员等级（完整版本）
  membershipTier: MembershipTier;
  membershipExpiresAt?: string; // ISO date
  
  // 身份状态
  currentRole: 'A' | 'B' | 'neutral';
  
  // LinkedIn 数据
  linkedinId?: string;
  linkedinProfileUrl?: string;
  linkedinHeadline?: string;
  linkedinExperience?: LinkedInExperience[];
  linkedinSkills?: string[];
  linkedinSyncedAt?: string;
  
  // 隐私授权记录
  privacyAuthorizations: PrivacyAuthorization[];
  
  // V5.1: 邀请码相关
  inviteCode?: string;
  invitedBy?: string;
  referralCount: number;
  referralRevenue: number;
  
  createdAt: string;
  updatedAt: string;
}

// ==================== Privacy Guard (隐私授权机制) ====================

export interface PrivacyAuthorization {
  id: string;
  /** 授权目标（甲方用户ID） */
  targetUserId: string;
  /** 授权时间 */
  authorizedAt: string;
  /** 授权有效期 */
  expiresAt: string;
  /** 授权范围 */
  scope: ('phone' | 'email' | 'wechat')[];
}

export interface MaskedContact {
  phone: string;   // e.g., "6543****"
  email: string;   // e.g., "a***@example.com"
  wechat?: string; // e.g., "wxid_****"
}

// ==================== Transaction: Smart Escrow (30% 订金托管) ====================

export type TaskStatus = 
  | 'draft'           // 草稿
  | 'published'       // 已发布，等待匹配
  | 'matched'         // 已匹配乙方
  | 'deposit_locked'  // 30% 订金已锁定
  | 'in_progress'     // 工作中
  | 'delivered'       // 已交付，等待验收
  | 'completed'       // 已完成
  | 'disputed'        // 争议中
  | 'cancelled';      // 已取消

export interface Task {
  id: string;
  // 甲方信息
  partyAId: string;
  partyAMaskedName: string;
  
  // 乙方信息（匹配后填充）
  partyBId?: string;
  partyBMaskedName?: string;
  
  // 任务内容
  title: string;
  description: string;
  requiredSkills: string[];
  
  // 财务信息
  totalAmount: number;      // 总报酬 (HKD)
  depositAmount: number;    // 30% 订金
  platformFee: number;      // 平台维护费（固定低额）
  
  // V5.1: Executive 分紅
  referrerId?: string;
  referralFee: number;
  
  // 状态
  status: TaskStatus;
  
  // 时间戳
  createdAt: string;
  publishedAt?: string;
  depositLockedAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  
  // 交付内容
  deliverables?: string[];
  
  // 评价
  partyARating?: number;
  partyBRating?: number;
  partyAReview?: string;
  partyBReview?: string;
}

// 非雇佣契约声明
export const NON_EMPLOYMENT_CLAUSE = `
本交易依据香港《职业介绍所规例》及《雇佣条例》下之「自雇人士服务采购」框架进行。
甲方（服务采购方）与乙方（服务提供方）不构成雇佣关系。
乙方作为独立承包人，自行承担工作方法、时间及地点的决定权。
平台仅作为技术服务提供者，不参与具体服务内容的监督与管理。
`;

// ==================== Platform Fee Structure ====================

/** 零佣金，仅收取透明维护费 */
export interface PlatformFee {
  /** 固定行政费（每笔交易） */
  fixedFee: number;
  /** 费用用途说明 */
  breakdown: {
    cloudCost: number;      // 云端服务器
    paymentProcessing: number; // 支付处理
    legalCompliance: number;   // 合规成本
  };
}

// 默认费率（HKD）
export const DEFAULT_PLATFORM_FEE: PlatformFee = {
  fixedFee: 50, // HKD 50 per transaction
  breakdown: {
    cloudCost: 25,
    paymentProcessing: 15,
    legalCompliance: 10,
  },
};

// ==================== $FAC Token Economy ====================

export type FacTransactionType = 
  | 'reward_linkedin_auth'
  | 'reward_linkedin_sync'
  | 'reward_profile_complete'
  | 'reward_voice_input'
  | 'reward_feedback'
  | 'reward_referral'
  | 'consume_basic_decode'
  | 'consume_deep_decode'
  | 'consume_private_chat'
  | 'revenue_share';

export interface FacTransaction {
  id: string;
  userId: string;
  type: FacTransactionType;
  amount: number; // 正数为奖励，负数为消耗
  description: string;
  relatedTaskId?: string;
  relatedUserId?: string;
  createdAt: string;
}

// ==================== Invitation System ====================

export interface Invitation {
  id: string;
  code: string; // e.g., "FAC-A7K2P9"
  createdBy: string;
  createdAt: string;
  usedBy?: string;
  usedAt?: string;
  status: 'active' | 'used' | 'expired';
  discountPercent: number; // 首月折扣
}

// ==================== Constants ====================

export const DEFAULT_VAULT_VISIBILITY: UserProfile['vaultVisibility'] = 'private';

/** 30% 订金比例 */
export const DEPOSIT_RATE = 0.3;

/** Executive 分紅比例 */
export const REFERRAL_REVENUE_SHARE = 0.075; // 7.5%

/** 隐私授权有效期（天） */
export const PRIVACY_AUTH_EXPIRY_DAYS = 30;

/** 邀请码有效期（天） */
export const INVITE_CODE_EXPIRY_DAYS = 90;
