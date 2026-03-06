import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

const STORAGE_KEY_BALANCE = 'fac_wallet_balance';
const STORAGE_KEY_TXS = 'fac_wallet_transactions';

export interface WalletTransaction {
  id: string;
  date: string; // ISO date or YYYY-MM-DD
  label: string;
  amount: number; // positive = income, negative = expense
}

interface WalletState {
  facBalance: number;
  transactions: WalletTransaction[];
}

interface WalletContextValue extends WalletState {
  addTransaction: (tx: Omit<WalletTransaction, 'id'>) => void;
  setBalance: (balance: number) => void;
}

const defaultState: WalletState = {
  facBalance: 0,
  transactions: []
};

function loadState(): WalletState {
  try {
    const balanceRaw = localStorage.getItem(STORAGE_KEY_BALANCE);
    const txsRaw = localStorage.getItem(STORAGE_KEY_TXS);
    const facBalance = balanceRaw != null ? Math.max(0, parseInt(balanceRaw, 10) || 0) : 0;
    const transactions: WalletTransaction[] = txsRaw ? JSON.parse(txsRaw) : [];
    if (!Array.isArray(transactions)) return defaultState;
    return { facBalance, transactions };
  } catch {
    return defaultState;
  }
}

function saveState(state: WalletState) {
  try {
    localStorage.setItem(STORAGE_KEY_BALANCE, String(state.facBalance));
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(state.transactions));
  } catch (_) {}
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state.facBalance, state.transactions]);

  const addTransaction = useCallback((tx: Omit<WalletTransaction, 'id'>) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setState((prev) => ({
      facBalance: prev.facBalance + tx.amount,
      transactions: [{ ...tx, id }, ...prev.transactions]
    }));
  }, []);

  const setBalance = useCallback((balance: number) => {
    setState((prev) => ({ ...prev, facBalance: Math.max(0, balance) }));
  }, []);

  const value: WalletContextValue = {
    ...state,
    addTransaction,
    setBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
