/**
 * OneOS API 客户端
 * 与服务器端通信的基础配置
 * 
 * 设计原则：
 * - 慢连接：不依赖实时推送，客户端主动拉取
 * - 本地优先：API失败时使用本地缓存
 * - 用户主权：Token存储在本地，不上传到第三方
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'oneos_auth_token';
const USER_KEY = 'oneos_current_user';

// Token管理
export const tokenManager = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('存储Token失败:', e);
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('清除Token失败:', e);
    }
  },

  hasToken(): boolean {
    return !!this.getToken();
  },
};

// 当前用户管理
export const userManager = {
  getUser(): any | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('存储用户信息失败:', e);
    }
  },

  clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('清除用户信息失败:', e);
    }
  },

  isLoggedIn(): boolean {
    return tokenManager.hasToken() && !!this.getUser();
  },

  logout(): void {
    tokenManager.clearToken();
    this.clearUser();
  },
};

// API请求错误类型
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 基础请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // 添加认证Token
  if (requireAuth) {
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Token过期或无效
      if (response.status === 401) {
        tokenManager.clearToken();
        userManager.clearUser();
        // 可以在这里触发登录状态变更事件
        window.dispatchEvent(new CustomEvent('oneos:auth-expired'));
      }
      throw new ApiError(data.error || `请求失败 (${response.status})`, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // 网络错误
    throw new ApiError('网络连接失败，请检查网络设置', 0, { originalError: error });
  }
}

// API客户端
export const apiClient = {
  get<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return request<T>(endpoint, { method: 'GET' }, requireAuth);
  },

  post<T>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  },

  put<T>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  },

  delete<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' }, requireAuth);
  },
};

// 服务器配置
export const serverConfig = {
  baseUrl: API_BASE_URL,
  healthEndpoint: '/health',
  isAvailable: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default apiClient;
