import axios, { type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types/api';

type TokenRefreshResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 게스트: guestSession Cookie 자동 전송 (withCredentials: true)
  return config;
});

// 동시에 여러 요청이 401 날 때 refresh를 한 번만 하고 나머지는 대기
let isRefreshing = false;
let waitQueue: Array<(token: string | null) => void> = [];

const drainQueue = (token: string | null) => {
  waitQueue.forEach((cb) => cb(token));
  waitQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // refresh 엔드포인트 자체가 401이면 무한루프 방지
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // 이미 refresh 중이면 완료될 때까지 대기
    if (isRefreshing) {
      return new Promise<string | null>((resolve) => {
        waitQueue.push(resolve);
      }).then((newToken) => {
        if (!newToken) return Promise.reject(error);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await apiClient.post<ApiResponse<TokenRefreshResponse>>('/auth/refresh');
      const newToken = res.data.data.accessToken;

      localStorage.setItem('accessToken', newToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      drainQueue(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch {
      // refresh 실패 → 로그아웃 처리
      drainQueue(null);
      useAuthStore.getState().setLogout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
