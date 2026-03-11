/**
 * FAC Platform V5.1 - Decentralized Vault Context
 * 去中心化保险柜：IPFS/Arweave 存储 + 端到端加密
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { VaultItem, AccessRecord, StorageProvider, ColdWalletExport } from '../types/web3';
import { VAULT_CONSTANTS } from '../types/web3';

// ==================== Constants ====================

const VAULT_STORAGE_KEY = 'fac_vault_items_v51';
const VAULT_ACCESS_LOG_KEY = 'fac_vault_access_log_v51';

// ==================== Types ====================

interface VaultContextValue {
  // 保险柜状态
  items: VaultItem[];
  isLoading: boolean;
  storageUsed: number; // bytes
  storageLimit: number; // bytes
  
  // 核心操作
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'accessLog' | 'cid' | 'arweaveTxId'>) => Promise<VaultItem>;
  updateItem: (id: string, updates: Partial<VaultItem>) => Promise<VaultItem>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => VaultItem | undefined;
  
  // 加密/解密
  encryptContent: (content: string, password: string) => Promise<string>;
  decryptContent: (encrypted: string, password: string) => Promise<string>;
  
  // 存储操作
  uploadToIPFS: (content: string) => Promise<string>;
  uploadToArweave: (content: string) => Promise<string>;
  downloadFromStorage: (cid?: string, arweaveTxId?: string) => Promise<string>;
  
  // 冷钱包导出
  exportToColdWallet: (password: string) => Promise<ColdWalletExport>;
  importFromColdWallet: (exportData: ColdWalletExport, password: string) => Promise<boolean>;
  
  // 访问控制
  grantAccess: (itemId: string, toUserId: string, expiryDays: number) => Promise<void>;
  revokeAccess: (itemId: string, toUserId: string) => Promise<void>;
  verifyAccess: (itemId: string, accessorId: string) => boolean;
  getAccessLog: (itemId: string) => AccessRecord[];
  
  // 统计
  getStats: () => { total: number; byType: Record<string, number>; encrypted: number };
}

// ==================== Mock Encryption (生产环境使用 Web Crypto API) ====================

async function mockEncrypt(content: string, password: string): Promise<string> {
  // 模拟加密：Base64 + 简单混淆
  const encoded = btoa(unescape(encodeURIComponent(content)));
  const obfuscated = encoded.split('').reverse().join('') + '::' + btoa(password).slice(0, 8);
  return `enc:v1:${obfuscated}`;
}

async function mockDecrypt(encrypted: string, _password: string): Promise<string> {
  if (!encrypted.startsWith('enc:v1:')) {
    throw new Error('Invalid encryption format');
  }
  const payload = encrypted.slice(7);
  const [reversed] = payload.split('::');
  const decoded = reversed.split('').reverse().join('');
  return decodeURIComponent(escape(atob(decoded)));
}

// ==================== Mock IPFS Upload ====================

async function mockIPFSUpload(_content: string): Promise<string> {
  // 模拟 IPFS 上传延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  // 生成模拟 CID
  const mockCid = 'Qm' + Array(44).fill(0).map(() => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
  ).join('');
  return mockCid;
}

async function mockArweaveUpload(_content: string): Promise<string> {
  // 模拟 Arweave 上传（更久）
  await new Promise(resolve => setTimeout(resolve, 2500));
  // 生成模拟交易ID
  const mockTxId = Array(43).fill(0).map(() => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-='[Math.floor(Math.random() * 65)]
  ).join('');
  return mockTxId;
}

// ==================== Helper Functions ====================

function loadItemsFromStorage(): VaultItem[] {
  try {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function saveItemsToStorage(items: VaultItem[]) {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(items.slice(0, VAULT_CONSTANTS.MAX_VAULT_ITEMS)));
  } catch {
    // Ignore storage errors
  }
}

function generateId(): string {
  return `vault_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ==================== Context ====================

const VaultContext = createContext<VaultContextValue | null>(null);

// ==================== Provider ====================

interface VaultProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function VaultProvider({ children, userId = 'anonymous' }: VaultProviderProps) {
  const [items, setItems] = useState<VaultItem[]>(() => loadItemsFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [accessLogs, setAccessLogs] = useState<Record<string, AccessRecord[]>>({});

  // Persist to storage
  useEffect(() => {
    saveItemsToStorage(items);
  }, [items]);

  // Calculate storage usage
  const storageUsed = items.reduce((acc, item) => acc + item.content.length * 2, 0);
  const storageLimit = VAULT_CONSTANTS.MAX_ITEM_SIZE * VAULT_CONSTANTS.MAX_VAULT_ITEMS;

  // Add item
  const addItem = useCallback(async (
    itemData: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'accessLog' | 'cid' | 'arweaveTxId'>
  ): Promise<VaultItem> => {
    setIsLoading(true);
    
    try {
      let cid: string | undefined;
      let arweaveTxId: string | undefined;
      
      // 上传到去中心化存储
      if (itemData.storageProvider === 'ipfs') {
        cid = await mockIPFSUpload(itemData.content);
      } else if (itemData.storageProvider === 'arweave') {
        arweaveTxId = await mockArweaveUpload(itemData.content);
      }
      
      const newItem: VaultItem = {
        ...itemData,
        id: generateId(),
        cid,
        arweaveTxId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessLog: [{
          id: `access_${Date.now()}`,
          accessorId: userId,
          accessorType: 'owner',
          action: 'write',
          timestamp: new Date().toISOString(),
        }],
      };
      
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update item
  const updateItem = useCallback(async (id: string, updates: Partial<VaultItem>): Promise<VaultItem> => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }
    
    const updatedItem: VaultItem = {
      ...items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    const newItems = [...items];
    newItems[itemIndex] = updatedItem;
    setItems(newItems);
    
    return updatedItem;
  }, [items]);

  // Delete item
  const deleteItem = useCallback(async (id: string): Promise<void> => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Get item
  const getItem = useCallback((id: string): VaultItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  // Encrypt content
  const encryptContent = useCallback(async (content: string, password: string): Promise<string> => {
    return mockEncrypt(content, password);
  }, []);

  // Decrypt content
  const decryptContent = useCallback(async (encrypted: string, password: string): Promise<string> => {
    return mockDecrypt(encrypted, password);
  }, []);

  // Upload to IPFS
  const uploadToIPFS = useCallback(async (content: string): Promise<string> => {
    return mockIPFSUpload(content);
  }, []);

  // Upload to Arweave
  const uploadToArweave = useCallback(async (content: string): Promise<string> => {
    return mockArweaveUpload(content);
  }, []);

  // Download from storage
  const downloadFromStorage = useCallback(async (cid?: string, arweaveTxId?: string): Promise<string> => {
    if (!cid && !arweaveTxId) {
      throw new Error('No storage identifier provided');
    }
    // 模拟下载延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    // 返回模拟内容
    return `[Decrypted content from ${cid ? 'IPFS:' + cid : 'Arweave:' + arweaveTxId}]`;
  }, []);

  // Export to cold wallet
  const exportToColdWallet = useCallback(async (password: string): Promise<ColdWalletExport> => {
    const encryptedItems = await Promise.all(
      items.map(async item => ({
        ...item,
        content: item.encrypted ? item.content : await mockEncrypt(item.content, password),
      }))
    );
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId,
      items: encryptedItems,
    };
    
    const encryptedData = await mockEncrypt(JSON.stringify(exportData), password);
    const checksum = btoa(encryptedData).slice(0, 16); // 简单校验和
    
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId,
      encryptedData,
      checksum,
    };
  }, [items, userId]);

  // Import from cold wallet
  const importFromColdWallet = useCallback(async (exportData: ColdWalletExport, password: string): Promise<boolean> => {
    try {
      const decrypted = await mockDecrypt(exportData.encryptedData, password);
      const data = JSON.parse(decrypted);
      
      if (data.version !== '1.0' || data.userId !== userId) {
        return false;
      }
      
      // 恢复项目
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
      
      return true;
    } catch {
      return false;
    }
  }, [userId]);

  // Grant access
  const grantAccess = useCallback(async (itemId: string, toUserId: string, expiryDays: number): Promise<void> => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const accessRecord: AccessRecord = {
      id: `access_${Date.now()}`,
      accessorId: toUserId,
      accessorType: 'authorized',
      action: 'read',
      timestamp: new Date().toISOString(),
    };
    
    // 添加到访问日志
    setAccessLogs(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), accessRecord],
    }));
  }, [items]);

  // Revoke access
  const revokeAccess = useCallback(async (itemId: string, toUserId: string): Promise<void> => {
    setAccessLogs(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || []).filter(log => log.accessorId !== toUserId),
    }));
  }, []);

  // Verify access
  const verifyAccess = useCallback((itemId: string, accessorId: string): boolean => {
    const item = items.find(i => i.id === itemId);
    if (!item) return false;
    
    // 所有者总是有权访问
    if (item.userId === accessorId) return true;
    
    // 检查授权列表
    const logs = accessLogs[itemId] || [];
    return logs.some(log => log.accessorId === accessorId && log.action === 'read');
  }, [items, accessLogs]);

  // Get access log
  const getAccessLog = useCallback((itemId: string): AccessRecord[] => {
    const item = items.find(i => i.id === itemId);
    if (!item) return [];
    return [...(item.accessLog || []), ...(accessLogs[itemId] || [])];
  }, [items, accessLogs]);

  // Get stats
  const getStats = useCallback(() => {
    const byType: Record<string, number> = {};
    items.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
    });
    
    return {
      total: items.length,
      byType,
      encrypted: items.filter(item => item.encrypted).length,
    };
  }, [items]);

  const value: VaultContextValue = {
    items,
    isLoading,
    storageUsed,
    storageLimit,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    encryptContent,
    decryptContent,
    uploadToIPFS,
    uploadToArweave,
    downloadFromStorage,
    exportToColdWallet,
    importFromColdWallet,
    grantAccess,
    revokeAccess,
    verifyAccess,
    getAccessLog,
    getStats,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

// ==================== Hook ====================

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within VaultProvider');
  }
  return context;
}
