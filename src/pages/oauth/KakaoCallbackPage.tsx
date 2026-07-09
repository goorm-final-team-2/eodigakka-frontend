import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { loginWithKakao } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);
  const isProcessing = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const redirectUri = `${window.location.origin}/oauth/kakao/callback`;

    // StrictMode 이중 호출 방지: sessionStorage로 처리된 code 추적
    const processedCode = sessionStorage.getItem('kakao_processed_code');
    if (code && !isProcessing.current && processedCode !== code) {
      isProcessing.current = true;
      sessionStorage.setItem('kakao_processed_code', code);

      loginWithKakao(code, redirectUri)
        .then((response) => {
          if (response.data) {
            const { accessToken, user } = response.data;
            sessionStorage.removeItem('kakao_processed_code');
            // Zustand 전역 상태에 토큰과 유저 정보 저장
            setLogin(accessToken, user);
            // 메인 페이지(약속방 목록 등)로 이동
            navigate('/');
          }
        })
        .catch((error) => {
          sessionStorage.removeItem('kakao_processed_code');
          // eslint-disable-next-line no-console
          console.error('카카오 로그인 연동 실패:', error);
          navigate('/login');
        });
    }
  }, [searchParams, setLogin, navigate]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center">
      <div className="space-y-4 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-body text-ink-muted-80 font-medium">카카오 로그인 처리 중입니다...</p>
      </div>
    </div>
  );
}
