/**
 * ID生成工具
 * 生成唯一标识符，支持多种格式
 */

/**
 * 生成UUID v4
 */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 降级方案
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成短ID（8位，适合笔记ID）
 */
export function shortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成带前缀的ID
 */
export function prefixedId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${shortId()}`;
}

/**
 * 生成笔记ID（基于时间戳，可排序）
 */
export function noteId(): string {
  return `n_${Date.now().toString(36)}_${shortId()}`;
}
