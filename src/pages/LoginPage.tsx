import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getAppointment } from '@/api/appointment';
import { ROUTES } from '@/constants/routes';
import {
  clearGuestAppointmentContext,
  getGuestAppointmentContext,
  saveGuestAppointmentContext,
} from '@/utils/guestAppointmentContext';

// eslint-disable-next-line no-restricted-syntax
const KAKAO_BUTTON_STYLE = { backgroundColor: '#FEE500', color: '#191919' } as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  // 카카오 디벨로퍼스에 등록한 Redirect URI (로컬 개발 서버 기준 주소)
  const redirectUri = `${window.location.origin}/oauth/kakao/callback`;

  // 카카오 로그인창 주소 빌드
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${redirectUri}&response_type=code`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  useEffect(() => {
    const guestContext = getGuestAppointmentContext();
    if (!guestContext) return;

    let isActive = true;

    getAppointment(guestContext.appointmentId)
      .then((appointment) => {
        if (!isActive) return;

        localStorage.removeItem('accessToken');
        saveGuestAppointmentContext(appointment.id, appointment.inviteCode);
        navigate(ROUTES.ROOM.replace(':appointmentId', String(appointment.id)), { replace: true });
      })
      .catch(() => {
        clearGuestAppointmentContext();
      });

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-6">
      {/* 화면이 가로로 늘어지거나 찌그러지지 않도록 Max Width 360px 강제 지정 */}
      <div
        className="w-full flex flex-col items-center space-y-8 py-10"
        style={{ maxWidth: '360px' }}
      >
        {/* Apple 스타일의 부드러운 앱 로고 아이콘 데코 */}
        <div className="w-20 h-20 bg-primary rounded-[20px] flex items-center justify-center shadow-lg transform transition-transform active:scale-95">
          <span className="text-on-primary font-display font-bold text-2xl tracking-tighter select-none">
            어디
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-display text-display-md font-bold text-ink tracking-tight">
            어디가까
          </h1>
          <p className="text-sm text-ink-muted-48">
            모임의 모든 장소와 위치를 한 번에 정하는 스마트 조율 서비스
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          <button
            onClick={handleKakaoLogin}
            className="w-full h-13 rounded-pill flex items-center justify-center gap-3 font-semibold text-sm transition-all transform active:scale-95 active:opacity-90 shadow-sm"
            style={KAKAO_BUTTON_STYLE}
          >
            {/* 카카오 로고 벡터 이미지 */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.947 1.954 5.51 4.957 6.945l-1.257 4.605c-.118.435.347.801.724.553l5.441-3.578c.389.05.787.075 1.135.075 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
            </svg>
            카카오 로그인으로 시작하기
          </button>

          <p className="text-[11px] text-ink-muted-48 text-center leading-relaxed max-w-[280px] mx-auto select-none">
            로그인 시 서비스 이용약관 및 개인정보 동의 방침에 동의하시는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
