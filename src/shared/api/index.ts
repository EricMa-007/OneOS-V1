/**
 * OneOS API 统一导出
 * 
 * 服务器端 API 客户端集合
 * - auth: 认证（注册/登录/用户信息）
 * - users: 用户与好友（人类节点发现）
 * - messages: 慢连接消息（静默收件箱）
 * - circles: 极小圈子（话题驱动，讨论自动沉淀）
 * - qrcode: 二维码（扫码添加好友）
 */

export { apiClient, tokenManager, userManager, ApiError, serverConfig } from './client';
export type { User } from './auth';
export { authApi } from './auth';
export type { Friend, FriendRequest, HumanRecommendation } from './users';
export { usersApi } from './users';
export type { Message, InboxResponse, ConversationResponse } from './messages';
export { messagesApi } from './messages';
export type { Circle, CircleMember, CircleDocument, CircleDetail } from './circles';
export { circlesApi } from './circles';
export type { QRCodeResponse, ScanResult } from './qrcode';
export { qrcodeApi } from './qrcode';

// 统一API对象
export const api = {
  auth: authApi,
  users: usersApi,
  messages: messagesApi,
  circles: circlesApi,
  qrcode: qrcodeApi,
};

export default api;
