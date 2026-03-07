/**
 * User Profile 與 LinkedIn API 對接欄位
 * 用於將 LinkedIn 數據複製到用戶的私密錢包（Private Vault）
 */

export interface LinkedInExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  /** 個人智慧錢包（Private Vault）內顯示的簡介 */
  bio?: string;
  /** 經 Agent 驗證的專業標籤，用於匹配 */
  verifiedTags: string[];
  /** 加密的實戰案例邏輯（僅供 Agent 匹配） */
  encryptedCaseLogicRef?: string;
  /** 錢包數據公開狀態：private | partial | public */
  vaultVisibility: 'private' | 'partial' | 'public';

  /** 會員等級（V2.0+ 收費級別；executive = Partner Tier） */
  membershipTier?: 'basic' | 'professional' | 'executive';

  /** ─── V2.1 合夥人機制 (Partner Tier) ─── */

  /** 專屬邀請碼（鏈上唯一，Executive 自動生成） */
  referralCode?: string;
  /** 已邀請用戶列表（ID 或 email 脫敏） */
  referredUsers?: string[];
  /** 累積智慧分紅餘額（法幣/穩定幣，以 HKD 顯示） */
  dividendBalanceHKD?: number;
  /** 分紅流水紀錄 */
  dividendHistory?: Array<{
    id: string;
    date: string;
    source: string;     // e.g. '成功撮合 · 跨境貿易'
    amountHKD: number;
    amountFAC?: number;
    payoutType: 'FAC' | 'stablecoin';
  }>;
  /** 治理投票紀錄 */
  governanceVotes?: Array<{
    proposalId: string;
    choice: string;
    votedAt: string;
  }>;

  /** ─── LinkedIn API 對接欄位 ─── */
  linkedinId?: string;
  linkedinProfileUrl?: string;
  /** 授權後同步的頭銜/職稱（用於職稱真實性背書） */
  linkedinHeadline?: string;
  /** 經歷列表（從 LinkedIn 複製到錢包） */
  linkedinExperience?: LinkedInExperience[];
  /** 技能列表 */
  linkedinSkills?: string[];
  /** 最後一次從 LinkedIn 同步的時間 */
  linkedinSyncedAt?: string;
}

export const DEFAULT_VAULT_VISIBILITY: UserProfile['vaultVisibility'] = 'private';
