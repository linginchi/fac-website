/**
 * FAC Platform - 本地錢包與技能管理系統
 * 所有敏感數據儲存在用戶終端，僅在使用時與後端對接
 */

import { encryptData, decryptData, generateWalletKeyPair, generateMnemonic } from './crypto';

// 技能類型
export interface Skill {
  id: string;
  label: string;
  category: 'legal' | 'finance' | 'trade' | 'tech' | 'language' | 'management' | 'education' | 'healthcare' | string;
  weight: number; // 0-100
  verified: boolean;
  source: 'ai-extracted' | 'manual' | 'linkedin' | 'zk-proof';
  createdAt: string;
  updatedAt: string;
  // ZK 證明相關
  zkProof?: {
    proofHash: string;
    verifiedAt: string;
    verifier: string;
  };
}

// 本地錢包數據結構
export interface LocalWallet {
  version: string;
  userId: string;
  address: string;
  encryptedPrivateKey: string;
  mnemonicEncrypted: string;
  balance: number;
  skills: Skill[];
  transactions: WalletTransaction[];
  lastSyncedAt: string;
}

// 錢包交易記錄
export interface WalletTransaction {
  id: string;
  type: 'receive' | 'send' | 'reward' | 'consume';
  amount: number;
  balanceAfter: number;
  label: string;
  timestamp: string;
  metadata?: {
    skillId?: string;
    taskId?: string;
    zkProofHash?: string;
  };
}

// 本地存儲鍵名
const WALLET_KEY_PREFIX = 'fac_wallet_';

// 獲取錢包存儲鍵
function getWalletKey(userId: string): string {
  return `${WALLET_KEY_PREFIX}${userId}`;
}

// 創建新錢包
export async function createLocalWallet(
  userId: string,
  password: string
): Promise<{ wallet: LocalWallet; mnemonic: string }> {
  // 生成錢包密鑰對
  const { address, privateKey } = generateWalletKeyPair();
  
  // 生成助記詞
  const mnemonic = generateMnemonic();
  
  // 加密私鑰和助記詞
  const encryptedPrivateKey = await encryptData(privateKey, password);
  const mnemonicEncrypted = await encryptData(mnemonic, password);
  
  const wallet: LocalWallet = {
    version: '1.0.0',
    userId,
    address,
    encryptedPrivateKey,
    mnemonicEncrypted,
    balance: 0,
    skills: [],
    transactions: [],
    lastSyncedAt: new Date().toISOString(),
  };
  
  // 儲存到 localStorage
  localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
  
  return { wallet, mnemonic };
}

// 獲取錢包
export function getLocalWallet(userId: string): LocalWallet | null {
  const data = localStorage.getItem(getWalletKey(userId));
  if (!data) return null;
  
  try {
    return JSON.parse(data) as LocalWallet;
  } catch {
    return null;
  }
}

// 解密私鑰
export async function decryptPrivateKey(
  wallet: LocalWallet,
  password: string
): Promise<string | null> {
  return await decryptData(wallet.encryptedPrivateKey, password);
}

// 解密助記詞
export async function decryptMnemonic(
  wallet: LocalWallet,
  password: string
): Promise<string | null> {
  return await decryptData(wallet.mnemonicEncrypted, password);
}

// 更新錢包餘額
export function updateWalletBalance(
  userId: string,
  newBalance: number
): boolean {
  const wallet = getLocalWallet(userId);
  if (!wallet) return false;
  
  wallet.balance = newBalance;
  wallet.lastSyncedAt = new Date().toISOString();
  
  localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
  return true;
}

// 添加交易記錄
export function addTransaction(
  userId: string,
  transaction: Omit<WalletTransaction, 'id'>
): boolean {
  const wallet = getLocalWallet(userId);
  if (!wallet) return false;
  
  const newTransaction: WalletTransaction = {
    ...transaction,
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  wallet.transactions.unshift(newTransaction);
  wallet.balance = transaction.balanceAfter;
  wallet.lastSyncedAt = new Date().toISOString();
  
  // 只保留最近 100 條交易記錄
  if (wallet.transactions.length > 100) {
    wallet.transactions = wallet.transactions.slice(0, 100);
  }
  
  localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
  return true;
}

// 添加技能
export function addSkill(userId: string, skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): boolean {
  const wallet = getLocalWallet(userId);
  if (!wallet) return false;
  
  const now = new Date().toISOString();
  const newSkill: Skill = {
    ...skill,
    id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  wallet.skills.push(newSkill);
  wallet.lastSyncedAt = now;
  
  localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
  return true;
}

// 更新技能
export function updateSkill(
  userId: string,
  skillId: string,
  updates: Partial<Skill>
): boolean {
  const wallet = getLocalWallet(userId);
  if (!wallet) return false;
  
  const skillIndex = wallet.skills.findIndex(s => s.id === skillId);
  if (skillIndex === -1) return false;
  
  wallet.skills[skillIndex] = {
    ...wallet.skills[skillIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  wallet.lastSyncedAt = new Date().toISOString();
  localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
  return true;
}

// 刪除技能
export function removeSkill(userId: string, skillId: string): boolean {
  const wallet = getLocalWallet(userId);
  if (!wallet) return false;
  
  wallet.skills = wallet.skills.filter(s => s.id !== skillId);
  wallet.lastSyncedAt = new Date().toISOString();
  
  localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
  return true;
}

// 獲取所有技能
export function getSkills(userId: string): Skill[] {
  const wallet = getLocalWallet(userId);
  return wallet?.skills || [];
}

// 為技能添加 ZK 證明
export function addSkillZKProof(
  userId: string,
  skillId: string,
  proof: { proofHash: string; verifier: string }
): boolean {
  return updateSkill(userId, skillId, {
    verified: true,
    zkProof: {
      ...proof,
      verifiedAt: new Date().toISOString(),
    },
  });
}

// 與後端同步錢包數據
export async function syncWalletWithBackend(
  userId: string,
  token: string
): Promise<boolean> {
  const wallet = getLocalWallet(userId);
  if (!wallet) return false;
  
  try {
    // 獲取後端最新數據
    const response = await fetch('/api/v2/wallet/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        lastSyncedAt: wallet.lastSyncedAt,
        localBalance: wallet.balance,
        localTransactions: wallet.transactions.slice(0, 10),
      }),
    });
    
    if (!response.ok) return false;
    
    const { data } = await response.json();
    
    // 更新本地錢包
    wallet.balance = data.balance;
    wallet.lastSyncedAt = new Date().toISOString();
    
    // 合併交易記錄
    if (data.transactions) {
      const existingIds = new Set(wallet.transactions.map(t => t.id));
      const newTransactions = data.transactions.filter(
        (t: WalletTransaction) => !existingIds.has(t.id)
      );
      wallet.transactions = [...newTransactions, ...wallet.transactions].slice(0, 100);
    }
    
    // 同步技能
    if (data.skills) {
      const localSkillIds = new Set(wallet.skills.map(s => s.id));
      data.skills.forEach((skill: Skill) => {
        if (!localSkillIds.has(skill.id)) {
          wallet.skills.push(skill);
        }
      });
    }
    
    localStorage.setItem(getWalletKey(userId), JSON.stringify(wallet));
    return true;
    
  } catch (error) {
    console.error('Wallet sync failed:', error);
    return false;
  }
}

// 生成技能使用簽名（用於與後端對接時驗證）
export async function signSkillUsage(
  wallet: LocalWallet,
  password: string,
  skillId: string,
  taskData: string
): Promise<{ signature: string; timestamp: string } | null> {
  const privateKey = await decryptPrivateKey(wallet, password);
  if (!privateKey) return null;
  
  // 簡化版簽名生成
  const timestamp = Date.now().toString();
  const message = `${wallet.address}:${skillId}:${taskData}:${timestamp}`;
  
  // 使用私鑰生成簽名（這裡是簡化實現）
  const signature = btoa(`${privateKey.slice(0, 16)}:${message}`);
  
  return { signature, timestamp };
}

// 備份錢包（導出加密數據）
export function exportWallet(userId: string): string | null {
  const wallet = getLocalWallet(userId);
  if (!wallet) return null;
  
  return JSON.stringify({
    version: wallet.version,
    userId: wallet.userId,
    address: wallet.address,
    encryptedPrivateKey: wallet.encryptedPrivateKey,
    mnemonicEncrypted: wallet.mnemonicEncrypted,
  });
}

// 恢復錢包（導入加密數據）
export function importWallet(backupData: string): boolean {
  try {
    const data = JSON.parse(backupData);
    
    if (!data.userId || !data.address || !data.encryptedPrivateKey) {
      return false;
    }
    
    const wallet: LocalWallet = {
      version: data.version || '1.0.0',
      userId: data.userId,
      address: data.address,
      encryptedPrivateKey: data.encryptedPrivateKey,
      mnemonicEncrypted: data.mnemonicEncrypted || '',
      balance: 0,
      skills: [],
      transactions: [],
      lastSyncedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(getWalletKey(data.userId), JSON.stringify(wallet));
    return true;
    
  } catch {
    return false;
  }
}

// 刪除錢包（登出時使用）
export function removeLocalWallet(userId: string): void {
  localStorage.removeItem(getWalletKey(userId));
}

// 獲取所有錢包地址列表
export function getAllWalletAddresses(): { userId: string; address: string }[] {
  const wallets: { userId: string; address: string }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(WALLET_KEY_PREFIX)) {
      const userId = key.replace(WALLET_KEY_PREFIX, '');
      const wallet = getLocalWallet(userId);
      if (wallet) {
        wallets.push({ userId, address: wallet.address });
      }
    }
  }
  
  return wallets;
}
