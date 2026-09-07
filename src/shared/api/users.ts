/**
 * 用户与好友 API
 * 用户资料、好友列表、好友请求、人类节点发现（基于话题）
 */

import { apiClient } from './client';
import type { User } from './auth';

export interface Friend extends User {
  friendshipSince: string;
  lastActiveAt?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: User;
  message: string;
  createdAt: string;
}

export interface HumanRecommendation {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  topicTags: string[];
  commonTags: string[];
  commonCount: number;
}

export const usersApi = {
  // 获取用户公开资料
  async getUser(userId: string): Promise<User & { isFriend: boolean }> {
    return apiClient.get<User & { isFriend: boolean }>(`/users/${userId}`);
  },

  // 获取好友列表
  async getFriends(): Promise<{ friends: Friend[]; total: number }> {
    return apiClient.get<{ friends: Friend[]; total: number }>('/users/me/friends');
  },

  // 发送好友请求
  async sendFriendRequest(toUserId: string, message?: string): Promise<{ message: string; requestId: string }> {
    return apiClient.post<{ message: string; requestId: string }>('/users/me/friend-requests', {
      toUserId,
      message,
    });
  },

  // 获取收到的好友请求
  async getFriendRequests(): Promise<{ requests: FriendRequest[]; total: number }> {
    return apiClient.get<{ requests: FriendRequest[]; total: number }>('/users/me/friend-requests');
  },

  // 接受好友请求
  async acceptFriendRequest(requestId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/me/friend-requests/${requestId}/accept`);
  },

  // 拒绝好友请求
  async rejectFriendRequest(requestId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/me/friend-requests/${requestId}/reject`);
  },

  // 删除好友
  async removeFriend(friendId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/me/friends/${friendId}`);
  },

  // 人类节点发现：基于话题标签推荐可能有深度对话的人
  async discoverHumans(topic?: string, limit: number = 10): Promise<{ recommendations: HumanRecommendation[]; total: number }> {
    const query = topic ? `?topic=${encodeURIComponent(topic)}&limit=${limit}` : `?limit=${limit}`;
    return apiClient.get<{ recommendations: HumanRecommendation[]; total: number }>(`/users/discover/humans${query}`);
  },
};

export default usersApi;
