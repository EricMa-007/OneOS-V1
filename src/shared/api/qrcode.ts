/**
 * 二维码 API
 * 生成用户二维码，用于扫码添加好友
 * 慢连接社交：通过二维码认识，而非搜索用户名
 */

import { apiClient } from './client';
import type { User } from './auth';

export interface QRCodeResponse {
  qrCode: string; // Data URL
  user: User;
  qrData: {
    type: string;
    version: string;
    userId: string;
    username: string;
    displayName: string;
    timestamp: number;
  };
}

export interface ScanResult {
  message: string;
  requestId?: string;
  targetUser?: User;
  alreadyFriend?: boolean;
  requestPending?: boolean;
}

export const qrcodeApi = {
  // 生成当前用户的二维码（用于添加好友）
  async getMyQRCode(): Promise<QRCodeResponse> {
    return apiClient.get<QRCodeResponse>('/qrcode/me');
  },

  // 生成指定用户的二维码（公开访问，用于分享）
  async getUserQRCode(userId: string): Promise<{ qrCode: string; user: User }> {
    return apiClient.get<{ qrCode: string; user: User }>(`/qrcode/user/${userId}`, false);
  },

  // 解析二维码内容（扫码后调用，获取用户信息并发送好友请求）
  async scanQRCode(qrData: string | object, message?: string): Promise<ScanResult> {
    return apiClient.post<ScanResult>('/qrcode/scan', {
      qrData,
      message,
    });
  },

  // 解析二维码内容（本地解析，不发送请求）
  parseQRCode(qrData: string): {
    type: string;
    userId: string;
    username: string;
    displayName: string;
    timestamp: number;
  } | null {
    try {
      const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      if (parsed.type === 'oneos-add-friend') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  // 生成二维码分享文本
  generateShareText(user: User): string {
    return `我在 OneOS 等你，扫码添加我为好友\n\n用户名: ${user.username}\n昵称: ${user.displayName}\n\nOneOS - 慢连接社交，深度对话，零打扰`;
  },
};

export default qrcodeApi;
