import React from 'react';
import { useNavigate } from 'react-router';

import { useAuthStore } from '@/stores/authStore';

export default function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setLogout } = useAuthStore();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas-parchment flex flex-col justify-center items-center px-6">
      <div className="w-full flex flex-col items-center text-center space-y-6 py-10" style={{ maxWidth: '360px' }}>
        
        <div className="w-16 h-16 bg-primary rounded-[18px] flex items-center justify-center shadow-md">
          <span className="text-on-primary font-display font-bold text-xl select-none">어디</span>
        </div>

        <h1 className="font-display text-display-lg font-bold text-ink">어디가까</h1>

        {isAuthenticated && user ? (
          // 로그인한 상태
          <div className="w-full bg-white border border-hairline rounded-lg p-5 space-y-5 shadow-sm">
            <div className="space-y-3">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="프로필" 
                  className="w-16 h-16 rounded-full mx-auto border-2 border-primary" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full mx-auto bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                  {user.nickname[0]}
                </div>
              )}
              <h2 className="font-display text-body-strong font-semibold text-ink">
                {user.nickname}님, 환영합니다!
              </h2>
              <p className="text-xs text-emerald-600 font-medium">✓ 카카오 로그인 성공 상태</p>
            </div>
            
            <button
              onClick={setLogout}
              className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-ink-muted-80 font-semibold text-xs rounded-pill transition-all"
            >
              로그아웃 하기
            </button>
          </div>
        ) : (
          // 로그인 안 된 상태
          <div className="w-full bg-white border border-hairline rounded-lg p-6 space-y-4 shadow-sm">
            <p className="text-sm text-ink-muted-80 leading-relaxed font-medium">
              로그인 정보가 없습니다. <br /> 서비스를 이용하시려면 로그인을 진행해주세요.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full h-12 bg-primary text-on-primary font-semibold text-sm rounded-pill transition-all transform active:scale-95"
            >
              로그인하러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}