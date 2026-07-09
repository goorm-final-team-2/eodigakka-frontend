import apiClient from './index';

import type { KakaoLoginResponse } from '@/types/user';

/**
 * 1) 실제 카카오 로그인 API 호출
 */
export const loginWithKakao = (code: string, redirectUri: string) => {
  return apiClient
    .post<KakaoLoginResponse>('/api/auth/kakao', {
      code,
      redirectUri,
    })
    .then((res) => res.data);
};

/**
 * 2) ★ 추가:
 * 카카오 서버를 거치지 않고 백엔드가 가짜 계정을 즉석에서 파서 로그인 세션을 만들어줍니다.
 */
export const loginWithDevAccount = (nickname?: string) => {
  return apiClient
    .post<KakaoLoginResponse>('/api/dev/auth/login', {
      socialId: 'test_dev_user_999', // 임의의 가짜 아이디 (겹치지 않게 아무거나 설정 가능)
      nickname: nickname || '가짜 테스트 유저',
      profileImage:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    })
    .then((res) => res.data);
};
