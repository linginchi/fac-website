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
