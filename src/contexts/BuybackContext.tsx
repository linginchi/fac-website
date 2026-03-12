/**
 * FAC Platform V5.1 - 回购透明度上下文
 * 管理 $FAC 回购机制的状态和数据
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { 
  BuybackRecord, 
  BuybackMetrics, 
  NextBuyback, 
  UserBuybackHoldings,
  TransparencyReport 
} from '../types/economy';

interface BuybackContextType {
  // 回购历史
  buybackHistory: BuybackRecord[];
  
  // 经济指标
  metrics: BuybackMetrics;
  
  // 下次回购预告
  nextBuyback: NextBuyback;
  
  // 用户持仓
  userHoldings: UserBuybackHoldings;
  
  // 获取透明度报告
  getTransparencyReport: () => TransparencyReport;
  
  // 手动刷新数据（预留）
  refreshData: () => Promise<void>;
}

const BuybackContext = createContext<BuybackContextType | undefined>(undefined);

// 模拟历史回购数据
const MOCK_BUYBACK_HISTORY: BuybackRecord[] = [
  {
    id: 'bb-2025q1',
    quarter: '2025 Q1',
    totalRevenue: 280000,
    buybackPool: 84000,
    facPrice: 0.012,
    totalBuyback: 7000000,
    totalBurned: 3500000,
    status: 'executed',
    executedAt: '2025-01-15T00:00:00Z',
    txHash: '0x8f7e6d5c4b3a2910f1e2d3c4b5a6978e9f0a1b2c',
  },
  {
    id: 'bb-2024q4',
    quarter: '2024 Q4',
    totalRevenue: 250000,
    buybackPool: 75000,
    facPrice: 0.010,
    totalBuyback: 7500000,
    totalBurned: 3750000,
    status: 'executed',
    executedAt: '2024-10-15T00:00:00Z',
    txHash: '0x9e8f7d6c5b4a3920f2e1d0c9b8a7f6e5d4c3b2a1',
  },
  {
    id: 'bb-2024q3',
    quarter: '2024 Q3',
    totalRevenue: 220000,
    buybackPool: 66000,
    facPrice: 0.009,
    totalBuyback: 7333333,
    totalBurned: 3666666,
    status: 'executed',
    executedAt: '2024-07-15T00:00:00Z',
    txHash: '0x1a2b3c4d5e6f7081f2e3d4c5b6a7989e0f1a2b3c',
  },
  {
    id: 'bb-2024q2',
    quarter: '2024 Q2',
    totalRevenue: 190000,
    buybackPool: 57000,
    facPrice: 0.008,
    totalBuyback: 7125000,
    totalBurned: 3562500,
    status: 'executed',
    executedAt: '2024-04-15T00:00:00Z',
    txHash: '0x2b3c4d5e6f708192e3d4c5b6a7989e0f1a2b3c4d',
  },
  {
    id: 'bb-2024q1',
    quarter: '2024 Q1',
    totalRevenue: 160000,
    buybackPool: 48000,
    facPrice: 0.007,
    totalBuyback: 6857142,
    totalBurned: 3428571,
    status: 'executed',
    executedAt: '2024-01-15T00:00:00Z',
    txHash: '0x3c4d5e6f708192e3d4c5b6a7989e0f1a2b3c4d5e',
  },
];

// 模拟经济指标
const MOCK_METRICS: BuybackMetrics = {
  totalSupply: 1000000000, // 10亿
  circulatingSupply: 850000000, // 8.5亿流通
  burnedSupply: 17908737, // 约1790万已销毁
  buybackReserve: 15000000, // 1500万回购池
  activeUsers: 45231,
  lastBuybackDate: '2025-01-15T00:00:00Z',
};

// 模拟下次回购预告
const MOCK_NEXT_BUYBACK: NextBuyback = {
  scheduledDate: '2025-04-15',
  estimatedPool: 95000,
  projectedPrice: 0.014,
  daysRemaining: 35,
};

// 模拟用户持仓
const MOCK_USER_HOLDINGS: UserBuybackHoldings = {
  balance: 2580,
  estimatedValue: 25.80, // 按 0.01 估算
  participationEligible: true, // >= 1000
  rank: 'Top 5%',
};

export function BuybackProvider({ children }: { children: ReactNode }) {
  const [buybackHistory] = useState<BuybackRecord[]>(MOCK_BUYBACK_HISTORY);
  const [metrics] = useState<BuybackMetrics>(MOCK_METRICS);
  const [nextBuyback] = useState<NextBuyback>(MOCK_NEXT_BUYBACK);
  const [userHoldings] = useState<UserBuybackHoldings>(MOCK_USER_HOLDINGS);

  // 获取透明度报告
  const getTransparencyReport = useCallback((): TransparencyReport => {
    const totalBuyback = buybackHistory.reduce((sum, r) => sum + r.totalBuyback, 0);
    const totalBurned = buybackHistory.reduce((sum, r) => sum + r.totalBurned, 0);
    const totalRevenue = buybackHistory.reduce((sum, r) => sum + r.totalRevenue, 0);
    const averagePrice = totalRevenue * 0.3 / totalBuyback;

    return {
      totalRevenue,
      totalBuyback,
      totalBurned,
      averagePrice,
      lastUpdated: new Date().toISOString(),
    };
  }, [buybackHistory]);

  // 刷新数据（预留接口）
  const refreshData = useCallback(async () => {
    // TODO: 连接后端 API 获取实时数据
    console.log('Refreshing buyback data...');
  }, []);

  const value = useMemo(() => ({
    buybackHistory,
    metrics,
    nextBuyback,
    userHoldings,
    getTransparencyReport,
    refreshData,
  }), [buybackHistory, metrics, nextBuyback, userHoldings, getTransparencyReport, refreshData]);

  return (
    <BuybackContext.Provider value={value}>
      {children}
    </BuybackContext.Provider>
  );
}

export function useBuyback() {
  const context = useContext(BuybackContext);
  if (!context) {
    throw new Error('useBuyback must be used within a BuybackProvider');
  }
  return context;
}
