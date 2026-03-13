/**
 * FAC Platform V5.1 - API Client
 * 取代 localStorage 的 API 調用層
 */

const API_BASE = 'https://api-fac-platform.mark-377.workers.dev';

// 獲取 JWT Token
function getToken(): string | null {
  return localStorage.getItem('fac_auth_token');
}

// 通用請求函數
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || `API Error: ${response.status}`);
  }
  
  return data;
}

// ============ 認證 API (Email 優先) ============

// Email 驗證碼發送
export async function sendEmailVerificationCode(email: string): Promise<any> {
  return apiRequest('/api/v2/auth/send-email-code', 'POST', { email });
}

// 註冊 (Email 主鍵，電話可選)
export async function registerUser(data: {
  email: string;
  password: string;
  code: string;
  phone?: string;
  displayName?: string;
}): Promise<any> {
  return apiRequest('/api/v2/auth/register', 'POST', data);
}

// 登入 (支持 Email 或 Phone)
export async function loginUser(emailOrPhone: string, password: string): Promise<any> {
  const isEmail = emailOrPhone.includes('@');
  return apiRequest('/api/v2/auth/login', 'POST', { 
    [isEmail ? 'email' : 'phone']: emailOrPhone, 
    password 
  });
}

// 忘記密碼 (Email)
export async function forgotPassword(email: string): Promise<any> {
  return apiRequest('/api/v2/auth/forgot-password', 'POST', { email });
}

// 重設密碼 (Email)
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<any> {
  return apiRequest('/api/v2/auth/reset-password', 'POST', {
    email,
    code,
    newPassword,
  });
}

// ============ 用戶資料 API ============

export async function getUserProfile(): Promise<any> {
  return apiRequest('/api/v2/user/profile', 'GET');
}

export async function updateUserProfile(updates: {
  displayName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  hourlyRate?: number;
  yearsExperience?: number;
  companyName?: string;
  companySize?: string;
  industry?: string;
}): Promise<any> {
  return apiRequest('/api/v2/user/profile', 'PUT', updates);
}

// ============ 技能 API ============

export async function getUserSkills(): Promise<any> {
  return apiRequest('/api/v2/user/skills', 'GET');
}

export async function addUserSkill(skill: {
  id?: string;
  label: string;
  category: string;
  weight?: number;
  verified?: boolean;
  source?: string;
}): Promise<any> {
  return apiRequest('/api/v2/user/skills', 'POST', skill);
}

export async function removeUserSkill(skillId: string): Promise<any> {
  return apiRequest(`/api/v2/user/skills/${skillId}`, 'DELETE');
}

// ============ 交易記錄 API ============

export async function getUserTransactions(limit: number = 50): Promise<any> {
  return apiRequest(`/api/v2/user/transactions?limit=${limit}`, 'GET');
}

// ============ 錢包同步 API ============

export async function syncWallet(localData: {
  localBalance: number;
  localTransactions: any[];
}): Promise<any> {
  return apiRequest('/api/v2/wallet/sync', 'POST', localData);
}

// ============ 文件解析 API ============

export async function parseFile(file: File, userRole?: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  if (userRole) {
    formData.append('userRole', userRole);
  }
  
  const response = await fetch(`${API_BASE}/api/parse/file`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || `Parse Error: ${response.status}`);
  }
  
  return data;
}

// ============ 平台配置 API ============

export async function getPlatformConfig(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/public/config`, {
    method: 'GET',
  });
  return response.json();
}

// 本地緩存輔助函數（僅用於非敏感數據）
export const cache = {
  set: (key: string, value: any, ttlMinutes: number = 5) => {
    const item = {
      value,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };
    localStorage.setItem(`fac_cache_${key}`, JSON.stringify(item));
  },
  
  get: (key: string): any | null => {
    const itemStr = localStorage.getItem(`fac_cache_${key}`);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(`fac_cache_${key}`);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },
  
  clear: (key: string) => {
    localStorage.removeItem(`fac_cache_${key}`);
  },
  
  clearAll: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('fac_cache_'))
      .forEach(key => localStorage.removeItem(key));
  },
};
