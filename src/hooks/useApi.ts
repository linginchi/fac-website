/**
 * FAC Platform V5.1 - API Hooks
 * 用于与 Cloudflare Workers API 交互
 */

import { useState, useCallback } from 'react';
import type { UserProfile, Task, SkillTag, SkillCategory } from '../types/user';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 通用 fetch 封装
async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }
    
    return data as ApiResponse<T>;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// ==================== Users API ====================

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listUsers = useCallback(async (params?: {
    skill?: string;
    category?: SkillCategory;
    role?: 'A' | 'B';
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    const queryParams = new URLSearchParams();
    if (params?.skill) queryParams.set('skill', params.skill);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.role) queryParams.set('role', params.role);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    
    const result = await fetchApi<UserProfile[]>(
      `/users?${queryParams.toString()}`
    );
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to fetch users');
    }
    
    return result;
  }, []);

  const getUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<UserProfile>(`/users/${userId}`);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to fetch user');
    }
    
    return result;
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: 'A' | 'B' | 'neutral') => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{}>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to update role');
    }
    
    return result;
  }, []);

  return {
    loading,
    error,
    listUsers,
    getUser,
    updateUserRole,
  };
}

// ==================== Skills API ====================

export function useSkills() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserSkills = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<SkillTag[]>(`/users/${userId}/skills`);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to fetch skills');
    }
    
    return result;
  }, []);

  const addSkill = useCallback(async (userId: string, skill: {
    label: string;
    category: SkillCategory;
    weight?: number;
    source?: 'linkedin' | 'manual' | 'ai-extracted';
  }) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{ id: string }>(`/users/${userId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skill),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to add skill');
    }
    
    return result;
  }, []);

  return {
    loading,
    error,
    getUserSkills,
    addSkill,
  };
}

// ==================== Tasks API ====================

export function useTasks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listTasks = useCallback(async (params?: {
    status?: string;
    partyA?: string;
    partyB?: string;
    skill?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.partyA) queryParams.set('party_a', params.partyA);
    if (params?.partyB) queryParams.set('party_b', params.partyB);
    if (params?.skill) queryParams.set('skill', params.skill);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    
    const result = await fetchApi<Task[]>(`/tasks?${queryParams.toString()}`);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to fetch tasks');
    }
    
    return result;
  }, []);

  const getTask = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<Task>(`/tasks/${taskId}`);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to fetch task');
    }
    
    return result;
  }, []);

  const createTask = useCallback(async (data: {
    party_a_id: string;
    title: string;
    description: string;
    required_skills: string[];
    total_amount: number;
  }) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{ id: string; deposit_amount: number }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to create task');
    }
    
    return result;
  }, []);

  const lockDeposit = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{}>(`/tasks/${taskId}/lock-deposit`, {
      method: 'PUT',
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to lock deposit');
    }
    
    return result;
  }, []);

  const acceptTask = useCallback(async (taskId: string, partyBId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{}>(`/tasks/${taskId}/accept`, {
      method: 'PUT',
      body: JSON.stringify({ party_b_id: partyBId }),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to accept task');
    }
    
    return result;
  }, []);

  const deliverTask = useCallback(async (taskId: string, deliverables: string[]) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{}>(`/tasks/${taskId}/deliver`, {
      method: 'PUT',
      body: JSON.stringify({ deliverables }),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to deliver task');
    }
    
    return result;
  }, []);

  const completeTask = useCallback(async (taskId: string, rating: number, review?: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{}>(`/tasks/${taskId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ rating, review }),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to complete task');
    }
    
    return result;
  }, []);

  return {
    loading,
    error,
    listTasks,
    getTask,
    createTask,
    lockDeposit,
    acceptTask,
    deliverTask,
    completeTask,
  };
}

// ==================== Privacy API ====================

export function usePrivacy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMaskedContact = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{
      phone: string | null;
      email: string | null;
      wechat: string | null;
    }>(`/privacy/contact/${userId}`);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to fetch contact');
    }
    
    return result;
  }, []);

  const authorizePrivacy = useCallback(async (data: {
    grantor_id: string;
    grantee_id: string;
    scope: ('phone' | 'email' | 'wechat')[];
  }) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{ id: string }>('/privacy/authorize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to authorize');
    }
    
    return result;
  }, []);

  const revealContact = useCallback(async (targetUserId: string, requesterId: string) => {
    setLoading(true);
    setError(null);
    
    const result = await fetchApi<{
      phone?: string;
      email?: string;
      wechat?: string;
      authorized_scope: string[];
      expires_at: string;
    }>(`/privacy/reveal/${targetUserId}?requester=${requesterId}`);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to reveal contact');
    }
    
    return result;
  }, []);

  return {
    loading,
    error,
    getMaskedContact,
    authorizePrivacy,
    revealContact,
  };
}
