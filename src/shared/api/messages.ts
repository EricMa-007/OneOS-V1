/**
 * 慢连接消息 API
 * 静默收件箱：消息不实时推送，客户端主动拉取
 * 零打扰：无在线状态、无已读回执的焦虑
 */

import { apiClient } from './client';
import type { User } from './auth';

export interface Message {
  id: string;
  fromUser: User;
  content: string;
  type: 'text' | 'image' | 'link' | 'note';
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  deliveredAt?: string;
  isMine?: boolean;
}

export interface InboxResponse {
  messages: Message[];
  unreadCount: number;
  total: number;
}

export interface ConversationResponse {
  messages: Message[];
  total: number;
}

export const messagesApi = {
  // 发送消息（慢连接：消息存储在服务器，对方下次拉取时收到）
  async sendMessage(
    toUserId: string,
    content: string,
    type: 'text' | 'image' | 'link' | 'note' = 'text',
    metadata?: Record<string, any>
  ): Promise<{ message: string; messageId: string; createdAt: string }> {
    return apiClient.post<{ message: string; messageId: string; createdAt: string }>('/messages/send', {
      toUserId,
      content,
      type,
      metadata,
    });
  },

  // 拉取收件箱（静默收件箱：客户端主动拉取，不实时推送）
  async getInbox(
    limit: number = 50,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<InboxResponse> {
    const query = `?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`;
    return apiClient.get<InboxResponse>(`/messages/inbox${query}`);
  },

  // 获取与某个用户的对话历史
  async getConversation(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ConversationResponse> {
    const query = `?limit=${limit}&offset=${offset}`;
    return apiClient.get<ConversationResponse>(`/messages/conversation/${userId}${query}`);
  },

  // 标记消息为已读
  async markAsRead(messageId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/messages/${messageId}/read`);
  },

  // 批量标记为已读
  async markAllAsRead(fromUserId?: string): Promise<{ message: string; updatedCount: number }> {
    return apiClient.post<{ message: string; updatedCount: number }>('/messages/read-all', {
      fromUserId,
    });
  },

  // 删除消息
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/messages/${messageId}`);
  },
};

export default messagesApi;
