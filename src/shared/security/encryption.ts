/**
 * OneOS 数据加密服务
 * 使用Web Crypto API进行加密，保护用户敏感数据
 * 
 * 作者：A08 鬼（安全工程师）
 */

// 加密算法配置
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits，GCM推荐
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * 从密码派生密钥（PBKDF2）
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 生成随机密钥
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 导出密钥为Base64字符串
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(raw);
}

/**
 * 从Base64字符串导入密钥
 */
export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(keyBase64);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密数据
 * @param data 要加密的字符串
 * @param key 加密密钥
 * @returns 加密后的Base64字符串（包含IV）
 */
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // 生成随机IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // 加密
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    dataBuffer
  );
  
  // 组合IV和加密数据: IV + encrypted
  const combined = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), IV_LENGTH);
  
  return arrayBufferToBase64(combined.buffer);
}

/**
 * 解密数据
 * @param encryptedBase64 加密后的Base64字符串（包含IV）
 * @param key 解密密钥
 * @returns 解密后的字符串
 */
export async function decrypt(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const combined = base64ToArrayBuffer(encryptedBase64);
  const combinedArray = new Uint8Array(combined);
  
  // 分离IV和加密数据
  const iv = combinedArray.slice(0, IV_LENGTH);
  const encryptedData = combinedArray.slice(IV_LENGTH);
  
  // 解密
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * 使用密码加密（PBKDF2派生密钥）
 * @param data 要加密的字符串
 * @param password 用户密码
 * @returns 加密后的Base64字符串（包含Salt和IV）
 */
export async function encryptWithPassword(data: string, password: string): Promise<string> {
  // 生成随机Salt
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  
  // 派生密钥
  const key = await deriveKey(password, salt);
  
  // 加密
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    dataBuffer
  );
  
  // 组合: Salt + IV + encrypted
  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH);
  
  return arrayBufferToBase64(combined.buffer);
}

/**
 * 使用密码解密
 * @param encryptedBase64 加密后的Base64字符串（包含Salt和IV）
 * @param password 用户密码
 * @returns 解密后的字符串
 */
export async function decryptWithPassword(encryptedBase64: string, password: string): Promise<string> {
  const combined = base64ToArrayBuffer(encryptedBase64);
  const combinedArray = new Uint8Array(combined);
  
  // 分离Salt、IV和加密数据
  const salt = combinedArray.slice(0, SALT_LENGTH);
  const iv = combinedArray.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedData = combinedArray.slice(SALT_LENGTH + IV_LENGTH);
  
  // 派生密钥
  const key = await deriveKey(password, salt);
  
  // 解密
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * 哈希数据（SHA-256）
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 32): string {
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 检查Web Crypto API是否可用
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof TextEncoder !== 'undefined';
}

// ============================================
// 工具函数
// ============================================

/**
 * ArrayBuffer转Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64转ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 加密服务单例
 */
export class EncryptionService {
  private static instance: EncryptionService | null = null;
  private masterKey: CryptoKey | null = null;
  private keyInitialized = false;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * 初始化主密钥（从localStorage加载或生成新密钥）
   */
  async initialize(): Promise<void> {
    if (this.keyInitialized) return;

    if (!isCryptoAvailable()) {
      console.warn('[Encryption] Web Crypto API不可用，数据加密已禁用');
      return;
    }

    try {
      // 尝试从localStorage加载密钥
      const storedKey = localStorage.getItem('oneos-master-key');
      if (storedKey) {
        this.masterKey = await importKey(storedKey);
      } else {
        // 生成新密钥
        this.masterKey = await generateKey();
        const exportedKey = await exportKey(this.masterKey);
        localStorage.setItem('oneos-master-key', exportedKey);
      }
      this.keyInitialized = true;
      console.log('[Encryption] 加密服务已初始化');
    } catch (error) {
      console.error('[Encryption] 初始化失败:', error);
    }
  }

  /**
   * 加密敏感数据
   */
  async encrypt(data: string): Promise<string> {
    if (!this.masterKey) return data; // 未初始化时返回明文
    try {
      return await encrypt(data, this.masterKey);
    } catch (error) {
      console.error('[Encryption] 加密失败:', error);
      return data;
    }
  }

  /**
   * 解密敏感数据
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.masterKey) return encryptedData; // 未初始化时返回原文
    try {
      return await decrypt(encryptedData, this.masterKey);
    } catch (error) {
      console.error('[Encryption] 解密失败:', error);
      return encryptedData;
    }
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.keyInitialized && this.masterKey !== null;
  }
}

export default EncryptionService;
