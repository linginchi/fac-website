/**
 * FAC Platform V5.1 - 用户上下文
 * 管理用户注册、登录状态、个人资料（去中心化设计）
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserProfile, MembershipTier, SkillTag } from '../types/user';

export type UserRole = 'A' | 'B' | 'neutral'; // A=甲方(需求方), B=乙方(供应方)

export interface ExtendedUserProfile extends UserProfile {
  // 注册流程额外字段
  phone?: string;
  location?: string;
  hourlyRate?: number;
  availability?: string[];
  cvUrl?: string;
  avatarUrl?: string;
  // 甲方特定
  companyName?: string;
  companySize?: string;
  industry?: string;
  // 乙方特定
  yearsExperience?: number;
  certifications?: string[];
  portfolioUrls?: string[];
}

interface UserContextType {
  // 当前用户
  currentUser: ExtendedUserProfile | null;
  isLoggedIn: boolean;
  userRole: UserRole;
  
  // 登录/注册
  login: (provider: 'linkedin' | 'email', data: { email: string; name?: string; linkedinId?: string }) => Promise<boolean>;
  logout: () => void;
  
  // 注册流程
  setUserRole: (role: UserRole) => void;
  updateProfile: (data: Partial<ExtendedUserProfile>) => void;
  completeRegistration: () => Promise<boolean>;
  
  // 资料管理
  updateAvatar: (url: string) => void;
  updateCV: (url: string) => void;
  addSkill: (skill: SkillTag) => void;
  removeSkill: (skillId: string) => void;
  
  // 去中心化钱包
  walletAddress: string | null;
  generateWallet: () => string;
  
  // 注册进度
  registrationStep: number;
  setRegistrationStep: (step: number) => void;
}

const USER_STORAGE_KEY = 'fac_user_profile_v51';
const AUTH_STORAGE_KEY = 'fac_user_auth_v51';
const WALLET_STORAGE_KEY = 'fac_user_wallet_v51';

const defaultUserProfile: ExtendedUserProfile = {
  id: '',
  skillMatrix: [],
  vaultVisibility: 'private',
  membershipTier: 'basic',
  currentRole: 'neutral',
  privacyAuthorizations: [],
  referralCount: 0,
  referralRevenue: 0,
  createdAt: '',
  updatedAt: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ExtendedUserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRoleState] = useState<UserRole>('neutral');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [registrationStep, setRegistrationStep] = useState(1);

  // 初始化时从 localStorage 加载
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
    
    if (storedUser && storedAuth) {
      try {
        const user = JSON.parse(storedUser);
        const auth = JSON.parse(storedAuth);
        
        // 检查登录是否过期（30天）
        if (auth.timestamp && Date.now() - auth.timestamp < 30 * 24 * 60 * 60 * 1000) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setUserRoleState(user.currentRole || 'neutral');
          if (storedWallet) {
            setWalletAddress(storedWallet);
          }
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // 保存用户数据到 localStorage
  const saveUser = useCallback((user: ExtendedUserProfile) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, []);

  // 登录
  const login = useCallback(async (
    provider: 'linkedin' | 'email',
    data: { email: string; name?: string; linkedinId?: string }
  ): Promise<boolean> => {
    const userId = `user_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newUser: ExtendedUserProfile = {
      ...defaultUserProfile,
      id: userId,
      email: data.email,
      displayName: data.name || data.email.split('@')[0],
      linkedinId: data.linkedinId,
      linkedinSyncedAt: provider === 'linkedin' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    setCurrentUser(newUser);
    setIsLoggedIn(true);
    saveUser(newUser);
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      userId,
      timestamp: Date.now(),
      provider,
    }));
    
    return true;
  }, [saveUser]);

  // 登出
  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRoleState('neutral');
    setWalletAddress(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  // 设置用户角色
  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    if (currentUser) {
      const updated = { ...currentUser, currentRole: role, updatedAt: new Date().toISOString() };
      setCurrentUser(updated);
      saveUser(updated);
    }
  }, [currentUser, saveUser]);

  // 更新个人资料
  const updateProfile = useCallback((data: Partial<ExtendedUserProfile>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
      setCurrentUser(updated);
      saveUser(updated);
    }
  }, [currentUser, saveUser]);

  // 生成去中心化钱包地址
  const generateWallet = useCallback((): string => {
    // 模拟生成钱包地址 - 实际应该使用ethers.js或类似库
    const wallet = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setWalletAddress(wallet);
    localStorage.setItem(WALLET_STORAGE_KEY, wallet);
    return wallet;
  }, []);

  // 完成注册
  const completeRegistration = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    // 生成钱包（如果还没有）
    if (!walletAddress) {
      generateWallet();
    }
    
    const updated = {
      ...currentUser,
      updatedAt: new Date().toISOString(),
    };
    
    setCurrentUser(updated);
    saveUser(updated);
    
    // 发放注册奖励
    // TODO: 调用 FAC 合约发放奖励
    
    return true;
  }, [currentUser, walletAddress, generateWallet, saveUser]);

  // 更新头像
  const updateAvatar = useCallback((url: string) => {
    updateProfile({ avatarUrl: url });
  }, [updateProfile]);

  // 更新CV
  const updateCV = useCallback((url: string) => {
    updateProfile({ cvUrl: url });
  }, [updateProfile]);

  // 添加技能
  const addSkill = useCallback((skill: SkillTag) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        skillMatrix: [...currentUser.skillMatrix, skill],
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(updated);
      saveUser(updated);
    }
  }, [currentUser, saveUser]);

  // 移除技能
  const removeSkill = useCallback((skillId: string) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        skillMatrix: currentUser.skillMatrix.filter(s => s.id !== skillId),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(updated);
      saveUser(updated);
    }
  }, [currentUser, saveUser]);

  const value: UserContextType = {
    currentUser,
    isLoggedIn,
    userRole,
    login,
    logout,
    setUserRole,
    updateProfile,
    completeRegistration,
    updateAvatar,
    updateCV,
    addSkill,
    removeSkill,
    walletAddress,
    generateWallet,
    registrationStep,
    setRegistrationStep,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
