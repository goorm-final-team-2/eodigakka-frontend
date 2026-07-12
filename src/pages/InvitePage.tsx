import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { getAppointmentInvite, joinAppointment, joinAppointmentAsGuest } from '@/api/appointment';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

// eslint-disable-next-line no-restricted-syntax
const KAKAO_BUTTON_STYLE = { backgroundColor: '#FEE500', color: '#191919' } as const;

export default function InvitePage() {
  const { inviteCode = '' } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [guestName, setGuestName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: invite,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['appointmentInvite', inviteCode],
    queryFn: () => getAppointmentInvite(inviteCode),
    enabled: Boolean(inviteCode),
  });

  const joinAsMemberMutation = useMutation({
    mutationFn: () => joinAppointment({ inviteCode }),
    onSuccess: (appointment) => {
      navigate(ROUTES.ROOM.replace(':appointmentId', String(appointment.id)));
    },
    onError: () => {
      setErrorMessage('약속방 참여에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });

  const joinAsGuestMutation = useMutation({
    mutationFn: () => joinAppointmentAsGuest({ inviteCode, guestName: guestName.trim() }),
    onSuccess: (response) => {
      navigate(ROUTES.ROOM.replace(':appointmentId', String(response.appointment.id)));
    },
    onError: () => {
      setErrorMessage('게스트 참여에 실패했습니다. 이름과 초대 링크를 다시 확인해주세요.');
    },
  });

  const handleKakaoJoin = () => {
    setErrorMessage(null);

    if (isAuthenticated) {
      joinAsMemberMutation.mutate();
      return;
    }

    sessionStorage.setItem('pending_invite_code', inviteCode);
    const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const redirectUri = `${window.location.origin}/oauth/kakao/callback`;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${redirectUri}&response_type=code`;
  };

  const handleGuestJoin = () => {
    setErrorMessage(null);

    if (!guestName.trim()) {
      setErrorMessage('게스트 이름을 입력해주세요.');
      return;
    }

    joinAsGuestMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-parchment text-ink-muted-48">
        초대 정보를 불러오는 중...
      </div>
    );
  }

  if (isError || !invite) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-6">
        <div
          className="w-full bg-canvas p-6 rounded-lg border border-hairline shadow-sm text-center space-y-4"
          style={{ maxWidth: '360px', minWidth: '320px' }}
        >
          <h1 className="font-display text-xl font-bold text-ink">초대 링크를 확인해주세요</h1>
          <p className="text-sm text-ink-muted-48">약속방 초대 정보를 불러오지 못했습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-on-primary rounded-pill py-3 text-sm font-semibold transition-all active:scale-95"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  const isPending = joinAsMemberMutation.isPending || joinAsGuestMutation.isPending;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-6">
      <div className="w-full space-y-5" style={{ maxWidth: '360px', minWidth: '320px' }}>
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-primary">어디가까</h1>
          <p className="text-sm text-ink-muted-48">약속방 초대가 도착했어요.</p>
        </div>

        <div className="bg-canvas p-5 rounded-lg shadow-sm border border-hairline space-y-4">
          <div>
            <p className="text-xs text-primary font-semibold mb-2">약속방 초대</p>
            <h2 className="text-lg font-bold text-ink">{invite.title}</h2>
            {invite.description && (
              <p className="text-sm text-ink-muted-48 mt-1">{invite.description}</p>
            )}
          </div>

          <div className="space-y-2 text-sm text-ink-muted-80">
            <div className="bg-canvas-parchment px-3 py-2 rounded-sm">
              📅 {invite.appointmentDate} {invite.appointmentTime}
            </div>
            {invite.preferredArea && (
              <div className="bg-canvas-parchment px-3 py-2 rounded-sm">
                📍 {invite.preferredArea}
              </div>
            )}
            {invite.notice && (
              <div className="bg-canvas-parchment px-3 py-2 rounded-sm">공지: {invite.notice}</div>
            )}
          </div>
        </div>

        <div className="bg-canvas p-5 rounded-lg shadow-sm border border-hairline space-y-4">
          <button
            onClick={handleKakaoJoin}
            disabled={isPending}
            className="w-full h-13 rounded-pill flex items-center justify-center gap-3 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            style={KAKAO_BUTTON_STYLE}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.947 1.954 5.51 4.957 6.945l-1.257 4.605c-.118.435.347.801.724.553l5.441-3.578c.389.05.787.075 1.135.075 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
            </svg>
            카카오 로그인으로 참여
          </button>

          <div className="space-y-3">
            <label htmlFor="guestName" className="block text-sm font-semibold text-ink">
              게스트로 참여
            </label>
            <input
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full rounded-lg border border-hairline bg-canvas-parchment px-4 py-3 text-sm text-ink outline-none focus:border-primary"
            />
            <button
              onClick={handleGuestJoin}
              disabled={isPending}
              className="w-full bg-primary text-on-primary rounded-pill py-3 text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              게스트로 입장하기
            </button>
          </div>

          {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}
