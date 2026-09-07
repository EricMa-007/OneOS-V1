/**
 * 极小圈子 API
 * 最多10人，话题驱动，无消息流，所有讨论自动沉淀为共享文档
 */

import { apiClient } from './client';
import type { User } from './auth';

export interface Circle {
  id: string;
  name: string;
  description: string;
  topic: string;
  ownerId: string;
  maxMembers: number;
  memberCount: number;
  isPrivate: boolean;
  createdAt: string;
  lastActivityAt: string;
  myRole?: 'owner' | 'admin' | 'member';
  joinedAt?: string;
}

export interface CircleMember {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface CircleDocument {
  id: string;
  title: string;
  content: string;
  contentType: string;
  isPinned: boolean;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface CircleDetail extends Circle {
  isMember: boolean;
  myRole: string | null;
  members: CircleMember[];
}

export const circlesApi = {
  // 创建圈子
  async createCircle(data: {
    name: string;
    description?: string;
    topic: string;
    isPrivate?: boolean;
  }): Promise<{ message: string; circle: Circle }> {
    return apiClient.post<{ message: string; circle: Circle }>('/circles', data);
  },

  // 获取圈子列表（公开圈子 + 我加入的圈子）
  async getCircles(topic?: string, limit: number = 20, offset: number = 0): Promise<{ circles: Circle[]; total: number }> {
    let query = `?limit=${limit}&offset=${offset}`;
    if (topic) query += `&topic=${encodeURIComponent(topic)}`;
    return apiClient.get<{ circles: Circle[]; total: number }>(`/circles${query}`, false);
  },

  // 获取我加入的圈子
  async getMyCircles(): Promise<{ circles: Circle[]; total: number }> {
    return apiClient.get<{ circles: Circle[]; total: number }>('/circles/me/mine');
  },

  // 获取圈子详情
  async getCircleDetail(circleId: string): Promise<CircleDetail> {
    return apiClient.get<CircleDetail>(`/circles/${circleId}`, false);
  },

  // 加入圈子
  async joinCircle(circleId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/circles/${circleId}/join`);
  },

  // 退出圈子
  async leaveCircle(circleId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/circles/${circleId}/leave`);
  },

  // 获取圈子共享文档列表（讨论自动沉淀为知识）
  async getCircleDocuments(circleId: string): Promise<{ documents: CircleDocument[]; total: number }> {
    return apiClient.get<{ documents: CircleDocument[]; total: number }>(`/circles/${circleId}/documents`);
  },

  // 创建圈子共享文档（讨论自动沉淀为知识）
  async createCircleDocument(circleId: string, data: {
    title: string;
    content?: string;
    contentType?: string;
  }): Promise<{ message: string; documentId: string }> {
    return apiClient.post<{ message: string; documentId: string }>(`/circles/${circleId}/documents`, data);
  },
};

export default circlesApi;
