/**
 * FAC Platform V5.1 - Invitation Code Context
 * 邀请码系统：生成、验证、追踪
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Invitation } from '../types/user';
import { INVITE_CODE_EXPIRY_DAYS } from '../types/user';

// ==================== Constants ====================

const INVITATIONS_STORAGE_KEY = 'fac_invitations_v51';
const MY_INVITES_STORAGE_KEY = 'fac_my_invites_v51';

// ==================== Types ====================

interface InvitationStats {
  totalGenerated: number;
  totalUsed: number;
  activeCount: number;
  totalRevenue: number;
}

interface InvitationContextValue {
  // 我的邀请码列表（作为邀请人）
  myInvites: Invitation[];
  
  // 核心操作
  generateInviteCode: (userId: string, discountPercent?: number) => Invitation;
  validateInviteCode: (code: string) => { valid: boolean; invitation?: Invitation; error?: string };
  useInviteCode: (code: string, userId: string) => boolean;
  
  // 查询
  getStats: (userId: string) => InvitationStats;
  getActiveCodes: (userId: string) => Invitation[];
  
  // 检查用户是否已被邀请
  hasBeenInvited: (userId: string) => boolean;
  getInvitedBy: (userId: string) => string | null;
}

// ==================== Helper Functions ====================

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
  let code = 'FAC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function loadInvitationsFromStorage(): Invitation[] {
  try {
    const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function loadMyInvitesFromStorage(): Invitation[] {
  try {
    const stored = localStorage.getItem(MY_INVITES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function saveInvitationsToStorage(invitations: Invitation[]) {
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
  } catch {
    // Ignore storage errors
  }
}

function saveMyInvitesToStorage(invites: Invitation[]) {
  try {
    localStorage.setItem(MY_INVITES_STORAGE_KEY, JSON.stringify(invites));
  } catch {
    // Ignore storage errors
  }
}

function isExpired(invitation: Invitation): boolean {
  const expiryDate = new Date(invitation.createdAt);
  expiryDate.setDate(expiryDate.getDate() + INVITE_CODE_EXPIRY_DAYS);
  return new Date() > expiryDate;
}

// ==================== Context ====================

const InvitationContext = createContext<InvitationContextValue | null>(null);

// ==================== Provider ====================

interface InvitationProviderProps {
  children: React.ReactNode;
}

export function InvitationProvider({ children }: InvitationProviderProps) {
  const [allInvitations, setAllInvitations] = useState<Invitation[]>(() => loadInvitationsFromStorage());
  const [myInvites, setMyInvites] = useState<Invitation[]>(() => loadMyInvitesFromStorage());

  // Persist to storage
  useEffect(() => {
    saveInvitationsToStorage(allInvitations);
  }, [allInvitations]);

  useEffect(() => {
    saveMyInvitesToStorage(myInvites);
  }, [myInvites]);

  // Generate new invite code
  const generateInviteCode = useCallback((
    userId: string,
    discountPercent = 20
  ): Invitation => {
    // Check if user already has too many active codes
    const userActiveCodes = allInvitations.filter(
      inv => inv.createdBy === userId && inv.status === 'active'
    );
    
    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (allInvitations.some(inv => inv.code === code) && attempts < 10) {
      code = generateCode();
      attempts++;
    }

    const invitation: Invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      code,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'active',
      discountPercent,
    };

    setAllInvitations(prev => [invitation, ...prev]);
    
    // Also add to my invites
    if (userId === 'current_user') { // Simplified check
      setMyInvites(prev => [invitation, ...prev]);
    }

    return invitation;
  }, [allInvitations]);

  // Validate invite code
  const validateInviteCode = useCallback((code: string): { valid: boolean; invitation?: Invitation; error?: string } => {
    const normalizedCode = code.toUpperCase().trim();
    const invitation = allInvitations.find(inv => inv.code === normalizedCode);

    if (!invitation) {
      return { valid: false, error: '邀请码不存在' };
    }

    if (invitation.status === 'used') {
      return { valid: false, error: '邀请码已被使用' };
    }

    if (isExpired(invitation)) {
      return { valid: false, error: '邀请码已过期' };
    }

    return { valid: true, invitation };
  }, [allInvitations]);

  // Use invite code
  const useInviteCode = useCallback((code: string, userId: string): boolean => {
    const normalizedCode = code.toUpperCase().trim();
    const invitationIndex = allInvitations.findIndex(inv => inv.code === normalizedCode);

    if (invitationIndex === -1) return false;

    const invitation = allInvitations[invitationIndex];
    
    if (invitation.status !== 'active' || isExpired(invitation)) {
      return false;
    }

    // Update invitation
    const updatedInvitation: Invitation = {
      ...invitation,
      usedBy: userId,
      usedAt: new Date().toISOString(),
      status: 'used',
    };

    const newInvitations = [...allInvitations];
    newInvitations[invitationIndex] = updatedInvitation;
    setAllInvitations(newInvitations);

    // Update my invites if applicable
    const myInviteIndex = myInvites.findIndex(inv => inv.code === normalizedCode);
    if (myInviteIndex !== -1) {
      const newMyInvites = [...myInvites];
      newMyInvites[myInviteIndex] = updatedInvitation;
      setMyInvites(newMyInvites);
    }

    return true;
  }, [allInvitations, myInvites]);

  // Get stats
  const getStats = useCallback((userId: string): InvitationStats => {
    const userInvites = allInvitations.filter(inv => inv.createdBy === userId);
    const used = userInvites.filter(inv => inv.status === 'used');
    const active = userInvites.filter(inv => inv.status === 'active' && !isExpired(inv));

    return {
      totalGenerated: userInvites.length,
      totalUsed: used.length,
      activeCount: active.length,
      totalRevenue: used.length * 100, // 假设每个成功邀请带来 100 $FAC
    };
  }, [allInvitations]);

  // Get active codes
  const getActiveCodes = useCallback((userId: string): Invitation[] => {
    return allInvitations.filter(
      inv => inv.createdBy === userId && inv.status === 'active' && !isExpired(inv)
    );
  }, [allInvitations]);

  // Check if user has been invited
  const hasBeenInvited = useCallback((userId: string): boolean => {
    return allInvitations.some(inv => inv.usedBy === userId);
  }, [allInvitations]);

  // Get who invited this user
  const getInvitedBy = useCallback((userId: string): string | null => {
    const invitation = allInvitations.find(inv => inv.usedBy === userId);
    return invitation?.createdBy || null;
  }, [allInvitations]);

  const value: InvitationContextValue = {
    myInvites,
    generateInviteCode,
    validateInviteCode,
    useInviteCode,
    getStats,
    getActiveCodes,
    hasBeenInvited,
    getInvitedBy,
  };

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
}

// ==================== Hook ====================

export function useInvitation() {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within InvitationProvider');
  }
  return context;
}
