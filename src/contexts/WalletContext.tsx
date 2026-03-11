/**
 * FAC Platform V5.1 - Web3 Wallet Context
 * 区块链钱包集成：MetaMask、WalletConnect、多链支持
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { WalletConnection, Web3Transaction, ChainType, ChainConfig } from '../types/web3';
import { SUPPORTED_CHAINS } from '../types/web3';

// ==================== Types ====================

interface WalletContextValue {
  // 连接状态
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  
  // 核心操作
  connect: (walletType: 'metamask' | 'walletconnect') => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  
  // 交易
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  
  // 查询
  getBalance: (tokenAddress?: string) => Promise<string>;
  getTransactionHistory: () => Web3Transaction[];
  
  // 监听
  isMetaMaskInstalled: boolean;
}

// ==================== Constants ====================

const WALLET_STORAGE_KEY = 'fac_wallet_connection_v51';
const TX_HISTORY_KEY = 'fac_wallet_transactions_v51';

// ==================== Mock Implementations ====================

// 模拟 MetaMask 提供商
const mockMetaMaskProvider = {
  isMetaMask: true,
  request: async ({ method }: { method: string; params?: unknown[] }) => {
    switch (method) {
      case 'eth_requestAccounts':
        return ['0x' + Array(40).fill(0).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')];
      case 'eth_chainId':
        return '0x1';
      case 'eth_getBalance':
        return '0x' + (Math.random() * 10 * 1e18).toString(16);
      case 'eth_sendTransaction':
        return '0x' + Array(64).fill(0).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
      case 'personal_sign':
        return '0x' + Array(130).fill(0).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
      default:
        return null;
    }
  },
  on: () => {},
  removeListener: () => {},
};

// 检测 MetaMask
function detectMetaMask(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask;
}

// ==================== Context ====================

const WalletContext = createContext<WalletContextValue | null>(null);

// ==================== Provider ====================

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connection, setConnection] = useState<WalletConnection | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isConnected) return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Web3Transaction[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(TX_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const isMetaMaskInstalled = detectMetaMask();

  // Persist connection
  useEffect(() => {
    if (connection) {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(connection));
    } else {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, [connection]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(transactions.slice(0, 100)));
  }, [transactions]);

  // Connect wallet
  const connect = useCallback(async (walletType: 'metamask' | 'walletconnect') => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (walletType === 'metamask') {
        if (!isMetaMaskInstalled) {
          throw new Error('MetaMask not installed');
        }
        
        // 使用模拟提供商（生产环境使用真实 window.ethereum）
        const provider = typeof window !== 'undefined' 
          ? (window as unknown as { ethereum?: typeof mockMetaMaskProvider }).ethereum || mockMetaMaskProvider
          : mockMetaMaskProvider;
        
        const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
        const chainId = await provider.request({ method: 'eth_chainId' }) as string;
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }
        
        const address = accounts[0];
        
        // 获取余额
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }) as string;
        
        const balance = parseInt(balanceHex, 16).toString();
        
        setConnection({
          address,
          chainType: 'ethereum',
          walletType: 'metamask',
          connectedAt: new Date().toISOString(),
          isConnected: true,
          balance: {
            ETH: (parseInt(balance) / 1e18).toFixed(4),
          },
        });
      } else {
        // WalletConnect 模拟
        throw new Error('WalletConnect coming soon');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Disconnect
  const disconnect = useCallback(() => {
    setConnection(null);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  // Switch chain
  const switchChain = useCallback(async (_chainId: number) => {
    if (!connection) return;
    
    // 模拟链切换
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setConnection(prev => prev ? {
      ...prev,
      balance: {
        ...prev.balance,
        ETH: (Math.random() * 10).toFixed(4),
      },
    } : null);
  }, [connection]);

  // Send transaction
  const sendTransaction = useCallback(async (to: string, value: string, data?: string): Promise<string> => {
    if (!connection) throw new Error('Wallet not connected');
    
    const provider = typeof window !== 'undefined' 
      ? (window as unknown as { ethereum?: typeof mockMetaMaskProvider }).ethereum || mockMetaMaskProvider
      : mockMetaMaskProvider;
    
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: connection.address,
        to,
        value: '0x' + (parseFloat(value) * 1e18).toString(16),
        data: data || '0x',
      }],
    }) as string;
    
    // 记录交易
    const newTx: Web3Transaction = {
      id: `tx_${Date.now()}`,
      hash: txHash,
      from: connection.address,
      to,
      value,
      status: 'pending',
      timestamp: new Date().toISOString(),
      type: data ? 'contract_call' : 'transfer',
      description: data ? '智能合约调用' : '转账',
    };
    
    setTransactions(prev => [newTx, ...prev]);
    
    // 模拟确认
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTx.id ? { ...tx, status: 'confirmed' } : tx
      ));
    }, 3000);
    
    return txHash;
  }, [connection]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!connection) throw new Error('Wallet not connected');
    
    const provider = typeof window !== 'undefined' 
      ? (window as unknown as { ethereum?: typeof mockMetaMaskProvider }).ethereum || mockMetaMaskProvider
      : mockMetaMaskProvider;
    
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, connection.address],
    }) as string;
    
    return signature;
  }, [connection]);

  // Get balance
  const getBalance = useCallback(async (tokenAddress?: string): Promise<string> => {
    if (!connection) return '0';
    
    if (!tokenAddress) {
      return connection.balance.ETH || '0';
    }
    
    // 模拟代币余额
    return (Math.random() * 10000).toFixed(2);
  }, [connection]);

  // Get transaction history
  const getTransactionHistory = useCallback((): Web3Transaction[] => {
    return transactions;
  }, [transactions]);

  const value: WalletContextValue = {
    connection,
    isConnecting,
    error,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
    getBalance,
    getTransactionHistory,
    isMetaMaskInstalled,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// ==================== Hook ====================

export function useWeb3Wallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWeb3Wallet must be used within WalletProvider');
  }
  return context;
}
