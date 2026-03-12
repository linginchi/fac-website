/**
 * FAC Platform - 前端加密工具
 * 注意：這些工具在瀏覽器環境中使用 Web Crypto API
 */

// 生成隨機 ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${random}`;
}

// 生成助記詞
export function generateMnemonic(): string {
  const words = [
    'wisdom', 'legacy', 'vault', 'secure', 'blockchain', 'future',
    'trust', 'honor', 'prosper', 'harmony', 'balance', 'fortune',
    'eternal', 'knowledge', 'strength', 'wisdom', 'light', 'path'
  ];
  
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12).join(' ');
}

// 生成錢包密鑰對
export function generateWalletKeyPair(): { address: string; privateKey: string } {
  // 生成隨機私鑰 (32 bytes)
  const privateKeyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    privateKeyBytes[i] = Math.floor(Math.random() * 256);
  }
  const privateKey = btoa(String.fromCharCode(...privateKeyBytes));
  
  // 生成地址 (20 bytes，簡化版以太坊格式)
  const addressBytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    addressBytes[i] = Math.floor(Math.random() * 256);
  }
  const address = '0x' + Array.from(addressBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { address, privateKey };
}

// 使用密碼加密數據
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // 生成隨機鹽和 IV
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
  
  // 加密數據
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  const encryptedArray = new Uint8Array(encrypted);
  
  // 返回 Base64 編碼的鹽、IV 和密文
  return JSON.stringify({
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...encryptedArray))
  });
}

// 使用密碼解密數據
export async function decryptData(encryptedPackage: string, password: string): Promise<string | null> {
  try {
    const encoder = new TextEncoder();
    const { salt, iv, data } = JSON.parse(encryptedPackage);
    
    // 解碼 Base64
    const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const dataArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    
    // 派生密鑰
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
    
    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray },
      key,
      dataArray
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// 哈希密碼（用於本地密碼驗證）
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
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
  
  return JSON.stringify({
    salt: btoa(String.fromCharCode(...salt)),
    hash: btoa(String.fromCharCode(...hashArray))
  });
}

// 驗證密碼
export async function verifyPassword(password: string, hashPackage: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const { salt, hash } = JSON.parse(hashPackage);
    
    const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    const hashArray = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltArray,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const derivedArray = new Uint8Array(derivedHash);
    
    // 比較哈希值
    if (derivedArray.length !== hashArray.length) return false;
    
    for (let i = 0; i < derivedArray.length; i++) {
      if (derivedArray[i] !== hashArray[i]) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
