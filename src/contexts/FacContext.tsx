/**
 * FAC Platform V5.1 - $FAC Token Context
 * 完整的 Token 经济系统：奖励、消耗、分紅
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { FacTransaction, FacTransactionType, MembershipTier } from '../types/user';
import { TIER_CONFIG, REFERRAL_REVENUE_SHARE } from '../types/user';

// ==================== Constants ====================

const FAC_STORAGE_KEY = 'fac_wallet_v51';
const FAC_TRANSACTIONS_KEY = 'fac_transactions_v51';

// ==================== Types ====================

interface FacWallet {
  balance: number;
  lifetimeEarned: number;
  lifetimeConsumed: number;
  referralRevenue: number;
}

interface FacContextValue {
  // 钱包状态
  wallet: FacWallet;
  transactions: FacTransaction[];
  
  // 核心操作
  addReward: (type: FacTransactionType, description?: string, relatedId?: string) => void;
  consume: (type: FacTransactionType, description?: string, relatedId?: string) => boolean;
  addReferralRevenue: (amount: number, fromUserId: string) => void;
  
  // 查询
  getBalance: () => number;
  getTransactionHistory: (limit?: number) => FacTransaction[];
  getLifetimeStats: () => { earned: number; consumed: number; net: number };
  
  // 兑换折扣
  getDiscountedCost: (baseCost: number, tier: MembershipTier) => number;
}

// ==================== Default State ====================

const defaultWallet: FacWallet = {
  balance: 0,
  lifetimeEarned: 0,
  lifetimeConsumed: 0,
  referralRevenue: 0,
};

// ==================== Context ====================

const FacContext = createContext<FacContextValue | null>(null);

// ==================== Helper Functions ====================

function loadWalletFromStorage(): FacWallet {
  try {
    const stored = localStorage.getItem(FAC_STORAGE_KEY);
    if (stored) {
      return { ...defaultWallet, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore storage errors
  }
  return { ...defaultWallet };
}

function loadTransactionsFromStorage(): FacTransaction[] {
  try {
    const stored = localStorage.getItem(FAC_TRANSACTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function saveWalletToStorage(wallet: FacWallet) {
  try {
    localStorage.setItem(FAC_STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // Ignore storage errors
  }
}

function saveTransactionsToStorage(transactions: FacTransaction[]) {
  try {
    localStorage.setItem(FAC_TRANSACTIONS_KEY, JSON.stringify(transactions.slice(0, 1000)));
  } catch {
    // Ignore storage errors
  }
}

function getRewardAmount(type: FacTransactionType, tier: MembershipTier): number {
  const config = TIER_CONFIG[tier];
  switch (type) {
    case 'reward_linkedin_auth':
      return config.facRewards.linkedinAuth;
    case 'reward_linkedin_sync':
      return config.facRewards.linkedinSync;
    case 'reward_profile_complete':
      return config.facRewards.profileComplete;
    case 'reward_voice_input':
      return config.facRewards.voiceInput;
    case 'reward_feedback':
      return config.facRewards.feedback;
    case 'reward_referral':
      return 100; // 固定奖励
    default:
      return 0;
  }
}

function getConsumeAmount(type: FacTransactionType, tier: MembershipTier): number {
  const config = TIER_CONFIG[tier];
  switch (type) {
    case 'consume_basic_decode':
      return config.facCosts.basicDecode;
    case 'consume_deep_decode':
      return config.facCosts.deepDecode;
    case 'consume_private_chat':
      return config.facCosts.privateChat;
    default:
      return 0;
  }
}

// ==================== Provider ====================

interface FacProviderProps {
  children: React.ReactNode;
  userTier?: MembershipTier;
  userId?: string;
}

export function FacProvider({ children, userTier = 'basic', userId = 'anonymous' }: FacProviderProps) {
  const [wallet, setWallet] = useState<FacWallet>(() => loadWalletFromStorage());
  const [transactions, setTransactions] = useState<FacTransaction[]>(() => loadTransactionsFromStorage());

  // Persist to storage
  useEffect(() => {
    saveWalletToStorage(wallet);
  }, [wallet]);

  useEffect(() => {
    saveTransactionsToStorage(transactions);
  }, [transactions]);

  // Add reward
  const addReward = useCallback((
    type: FacTransactionType,
    description?: string,
    relatedId?: string
  ) => {
    const amount = getRewardAmount(type, userTier);
    if (amount <= 0) return;

    const transaction: FacTransaction = {
      id: `fac_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId,
      type,
      amount,
      description: description || type,
      relatedTaskId: relatedId,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [transaction, ...prev]);
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + amount,
      lifetimeEarned: prev.lifetimeEarned + amount,
    }));
  }, [userTier, userId]);

  // Consume tokens
  const consume = useCallback((
    type: FacTransactionType,
    description?: string,
    relatedId?: string
  ): boolean => {
    const amount = getConsumeAmount(type, userTier);
    if (amount <= 0) return true;

    if (wallet.balance < amount) {
      return false; // Insufficient balance
    }

    const transaction: FacTransaction = {
      id: `fac_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId,
      type,
      amount: -amount,
      description: description || type,
      relatedTaskId: relatedId,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [transaction, ...prev]);
    setWallet(prev => ({
      ...prev,
      balance: prev.balance - amount,
      lifetimeConsumed: prev.lifetimeConsumed + amount,
    }));

    return true;
  }, [userTier, userId, wallet.balance]);

  // Add referral revenue (for Executive tier)
  const addReferralRevenue = useCallback((amount: number, fromUserId: string) => {
    const revenue = Math.floor(amount * REFERRAL_REVENUE_SHARE);
    
    const transaction: FacTransaction = {
      id: `fac_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId,
      type: 'revenue_share',
      amount: revenue,
      description: `推荐分紅 (来自用户 ${fromUserId})`,
      relatedUserId: fromUserId,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [transaction, ...prev]);
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + revenue,
      referralRevenue: prev.referralRevenue + revenue,
      lifetimeEarned: prev.lifetimeEarned + revenue,
    }));
  }, [userId]);

  // Get balance
  const getBalance = useCallback(() => wallet.balance, [wallet.balance]);

  // Get transaction history
  const getTransactionHistory = useCallback((limit = 50) => {
    return transactions.slice(0, limit);
  }, [transactions]);

  // Get lifetime stats
  const getLifetimeStats = useCallback(() => ({
    earned: wallet.lifetimeEarned,
    consumed: wallet.lifetimeConsumed,
    net: wallet.lifetimeEarned - wallet.lifetimeConsumed,
  }), [wallet.lifetimeEarned, wallet.lifetimeConsumed]);

  // Get discounted cost
  const getDiscountedCost = useCallback((baseCost: number, tier: MembershipTier): number => {
    const discount = TIER_CONFIG[tier].features.decodeDiscount;
    return Math.floor(baseCost * (1 - discount));
  }, []);

  const value: FacContextValue = {
    wallet,
    transactions,
    addReward,
    consume,
    addReferralRevenue,
    getBalance,
    getTransactionHistory,
    getLifetimeStats,
    getDiscountedCost,
  };

  return (
    <FacContext.Provider value={value}>
      {children}
    </FacContext.Provider>
  );
}

// ==================== Hook ====================

export function useFac() {
  const context = useContext(FacContext);
  if (!context) {
    throw new Error('useFac must be used within FacProvider');
  }
  return context;
}
