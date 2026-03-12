/**
 * FAC Platform - 加密工具函數
 */

// 生成隨機 ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${random}`;
}

// 生成 OTP 驗證碼
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// 使用 Web Crypto API 進行密碼哈希（bcrypt 替代方案）
export async function hashPassword(password: string): Promise<string> {
  // 使用 PBKDF2 進行密碼哈希
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordData = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = new Uint8Array(hash);
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `pbkdf2_sha256$100000$${saltBase64}$${hashBase64}`;
}

// 驗證密碼
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
      return false;
    }
    
    const iterations = parseInt(parts[1], 10);
    const saltBase64 = parts[2];
    const storedHashBase64 = parts[3];
    
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const derivedHashArray = new Uint8Array(derivedHash);
    const derivedHashBase64 = btoa(String.fromCharCode(...derivedHashArray));
    
    return derivedHashBase64 === storedHashBase64;
  } catch (error) {
    return false;
  }
}

// JWT 簽名
export async function signJWT(payload: any, env: { JWT_SECRET_KEY: string }): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7天過期
  };
  
  const encoder = new TextEncoder();
  
  const headerBase64 = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  const payloadBase64 = btoa(JSON.stringify(fullPayload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  const data = `${headerBase64}.${payloadBase64}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.JWT_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureArray = new Uint8Array(signature);
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${data}.${signatureBase64}`;
}

// 驗證 JWT
export async function verifyJWT(token: string, env: { JWT_SECRET_KEY: string }): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerBase64, payloadBase64, signatureBase64] = parts;
    
    // 驗證簽名
    const encoder = new TextEncoder();
    const data = `${headerBase64}.${payloadBase64}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.JWT_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // 解碼 Base64URL
    const base64UrlDecode = (str: string) => {
      const padding = '='.repeat((4 - str.length % 4) % 4);
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
      return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    };
    
    const signature = base64UrlDecode(signatureBase64);
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    
    if (!isValid) return null;
    
    // 解碼 payload
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    
    // 檢查過期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// 加密數據（用於本地錢包加密）
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // 從密碼派生密鑰
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  const encryptedArray = new Uint8Array(encrypted);
  
  return JSON.stringify({
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...encryptedArray))
  });
}

// 解密數據
export async function decryptData(encryptedPackage: string, password: string): Promise<string | null> {
  try {
    const encoder = new TextEncoder();
    const { salt, iv, data } = JSON.parse(encryptedPackage);
    
    const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const dataArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltArray,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray },
      key,
      dataArray
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    return null;
  }
}

// 生成錢包密鑰對（簡化版，實際應使用專業加密庫）
export function generateWalletKeyPair(): { address: string; privateKey: string } {
  // 生成隨機私鑰
  const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const privateKey = btoa(String.fromCharCode(...privateKeyBytes));
  
  // 生成地址（簡化版，實際應使用 Keccak-256 和以太坊地址格式）
  const addressBytes = crypto.getRandomValues(new Uint8Array(20));
  const address = '0x' + Array.from(addressBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { address, privateKey };
}

// 生成隨機助記詞
export function generateMnemonic(): string {
  const words = [
    'wisdom', 'legacy', 'vault', 'secure', 'blockchain', 'future',
    'trust', 'honor', 'prosper', 'harmony', 'balance', 'fortune',
    'wisdom', 'legacy', 'vault', 'secure', 'blockchain', 'future'
  ];
  
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12).join(' ');
}
