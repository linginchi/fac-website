/**
 * FAC Platform V5.1 - Identity Context
 * 核心术语：Party A (甲方/需求方) / Party B (乙方/提供方)
 * P0 要求：Logo 点击必须执行 重置意图 -> 重置身份 -> 回归首页
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { IdentityState, IdentityActions } from '../types/identity';

const STORAGE_KEY = 'fac_identity_context_v51';

const defaultState: IdentityState = {
  identityContext: 'neutral',
  tempIntent: null,
  lastSwitchTime: null,
};

function loadState(): IdentityState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as IdentityState;
      if (parsed.identityContext === 'A' || parsed.identityContext === 'B' || parsed.identityContext === 'neutral') {
        return {
          identityContext: parsed.identityContext,
          tempIntent: typeof parsed.tempIntent === 'string' ? parsed.tempIntent : null,
          lastSwitchTime: typeof parsed.lastSwitchTime === 'number' ? parsed.lastSwitchTime : null,
        };
      }
    }
  } catch (_) {}
  return defaultState;
}

function saveState(state: IdentityState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

type IdentityContextValue = IdentityState & IdentityActions;

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IdentityState>(defaultState);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  /** 切换为甲方 (Party A - 需求方)：发布任务、寻找解决方案 */
  const switchToA = useCallback((intent?: string) => {
    setState({
      identityContext: 'A',
      tempIntent: intent ?? null,
      lastSwitchTime: Date.now(),
    });
  }, []);

  /** 切换为乙方 (Party B - 提供方)：维护能力、接收邀约 */
  const switchToB = useCallback((intent?: string) => {
    setState({
      identityContext: 'B',
      tempIntent: intent ?? null,
      lastSwitchTime: Date.now(),
    });
  }, []);

  /** P0: 重置身份和意图 */
  const resetIdentity = useCallback(() => {
    setState({
      identityContext: 'neutral',
      tempIntent: null,
      lastSwitchTime: null,
    });
    // 清除存储
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const getIdentityLabel = useCallback((): string => {
    switch (state.identityContext) {
      case 'A':
        return '甲方 / Party A';
      case 'B':
        return '乙方 / Party B';
      default:
        return '探索中 / Exploring';
    }
  }, [state.identityContext]);

  const getIdentityDescription = useCallback((): string => {
    switch (state.identityContext) {
      case 'A':
        return '发布任务、寻找解决方案';
      case 'B':
        return '维护能力、接收邀约';
      default:
        return '请选择您的角色';
    }
  }, [state.identityContext]);

  const value: IdentityContextValue = {
    ...state,
    switchToA,
    switchToB,
    resetIdentity,
    getIdentityLabel,
    getIdentityDescription,
  };

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error('useIdentity must be used within IdentityProvider');
  }
  return ctx;
}
