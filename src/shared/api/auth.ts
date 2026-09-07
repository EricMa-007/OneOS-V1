/**
 * 认证 API
 * 注册、登录、获取当前用户、更新用户信息
 */

import { apiClient, tokenManager, userManager } from './client';

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  topicTags: string[];
  createdAt: string;
  lastActiveAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  // 注册
  async register(username: string, password: string, displayName?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      username,
      password,
      displayName,
    }, false);
    
    tokenManager.setToken(response.token);
    userManager.setUser(response.user);
    return response;
  },

  // 登录
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      username,
      password,
    }, false);
    
    tokenManager.setToken(response.token);
    userManager.setUser(response.user);
    return response;
  },

  // 获取当前用户信息
  async getMe(): Promise<User> {
    const user = await apiClient.get<User>('/auth/me');
    userManager.setUser(user);
    return user;
  },

  // 更新当前用户信息
  async updateMe(data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    topicTags?: string[];
  }): Promise<{ message: string; user: User }> {
    const response = await apiClient.put<{ message: string; user: User }>('/auth/me', data);
    userManager.setUser(response.user);
    return response;
  },

  // 登出
  logout(): void {
    userManager.logout();
    window.dispatchEvent(new CustomEvent('oneos:logout'));
  },

  // 检查登录状态
  isLoggedIn(): boolean {
    return userManager.isLoggedIn();
  },

  // 获取当前用户（从本地缓存）
  getCurrentUser(): User | null {
    return userManager.getUser();
  },
};

export default authApi;
