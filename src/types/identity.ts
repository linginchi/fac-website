/**
 * FAC Platform V5.1 - Identity System
 * 核心术语：Party A (甲方/需求方) / Party B (乙方/提供方)
 * 废除 2.0 时代的「雇主/专家」二元论
 */

export type IdentityContext = 'A' | 'B' | 'neutral';

export interface IdentityState {
  identityContext: IdentityContext;
  tempIntent: string | null;
  lastSwitchTime: number | null;
}

export interface IdentityActions {
  /** 切换为甲方 (Party A - 需求方)：发布任务、寻找解决方案 */
  switchToA: (intent?: string) => void;
  /** 切换为乙方 (Party B - 提供方)：维护能力、接收邀约 */
  switchToB: (intent?: string) => void;
  /** 重置身份和意图 - P0 优先级 */
  resetIdentity: () => void;
  /** 获取当前身份标签 */
  getIdentityLabel: () => string;
  /** 获取身份描述 */
  getIdentityDescription: () => string;
}

/** 甲方核心动作 */
export interface PartyAActions {
  /** 发布意图 */
  publishIntent: (intent: string) => void;
  /** 锁定 30% 订金 */
  lockDeposit: (taskId: string, amount: number) => Promise<boolean>;
  /** 验收交付 */
  acceptDelivery: (taskId: string) => Promise<boolean>;
}

/** 乙方核心动作 */
export interface PartyBActions {
  /** 维护能力矩阵 */
  updateSkillMatrix: (skills: SkillTag[]) => Promise<boolean>;
  /** 接收邀约 */
  receiveInvitation: (taskId: string) => void;
  /** 授权隐私揭露 */
  authorizePrivacy: (targetPartyAId: string) => Promise<boolean>;
  /** 执行工作并获得报酬 */
  executeAndEarn: (taskId: string) => Promise<boolean>;
}

/** 原子化能力标签 (Skill Matrix) */
export interface SkillTag {
  id: string;
  label: string;
  /** AI 权重建议 (0-100) */
  weight: number;
  /** 能力类别 */
  category: SkillCategory;
  /** 验证状态 */
  verified: boolean;
  /** 来源：linkedin / manual / ai-extracted */
  source: 'linkedin' | 'manual' | 'ai-extracted';
}

export type SkillCategory =
  | 'legal'      // 法律合规
  | 'finance'    // 金融财务
  | 'trade'      // 跨境贸易
  | 'tech'       // 技术工程
  | 'language'   // 语言翻译
  | 'management' // 管理咨询
  | 'education'  // 教育培训
  | 'healthcare' // 医疗健康
  | 'creative'   // 创意设计
  | 'other';     // 其他

/** 能力矩阵 */
export interface SkillMatrix {
  userId: string;
  tags: SkillTag[];
  /** 最后更新时间 */
  updatedAt: string;
  /** AI 生成的能力摘要 */
  aiSummary?: string;
}
