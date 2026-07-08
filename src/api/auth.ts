import apiClient from './index';
import type { KakaoLoginResponse } from '@/types/user';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

/**
 * 백엔드 서버에 카카오 인가 코드를 전달하여 로그인을 처리합니다.
 */
export const loginWithKakao = (code: string, redirectUri: string) => {
  return apiClient.post<ApiResponse<KakaoLoginResponse>>('/api/auth/kakao', {
    code,
    redirectUri,
  }).then((res) => res.data);
};