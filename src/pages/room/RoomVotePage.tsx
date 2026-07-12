import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import BottomSheet, { type SnapPoint } from '@/components/common/BottomSheet';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { LocationBottomSheet } from '@/components/location/LocationBottomSheet';
import KakaoMap from '@/components/map/KakaoMap';
import PlaceCandidateSheet from '@/components/vote/PlaceCandidateSheet';
import { ROUTES } from '@/constants/routes';
import { useAppointment } from '@/hooks/useAppointment';
import { useCloseAppointment } from '@/hooks/useCloseAppointment';
import { useLeaveAppointment } from '@/hooks/useLeaveAppointment';

type Tab = 'vote' | 'location';

const btnClass =
  'flex items-center justify-center w-9 h-9 rounded-full bg-surface-tile-1/80 backdrop-blur-md text-on-dark shadow-lg transition-all active:scale-95 pointer-events-auto';

const RoomVotePage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [snap, setSnap] = useState<SnapPoint>('hidden');
  const [tab, setTab] = useState<Tab>('vote');
  const [copied, setCopied] = useState(false);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const { data: appointment } = useAppointment(Number(appointmentId));
  const { mutate: closeAppointment, isPending: isClosingAppointment } = useCloseAppointment(
    Number(appointmentId),
  );
  const { mutate: leaveAppointment, isPending: isLeavingAppointment } = useLeaveAppointment(
    Number(appointmentId),
  );
  const canCloseAppointment = appointment?.role === 'HOST' && appointment?.status === 'CONFIRMED';
  const canLeaveAppointment = appointment?.role === 'MEMBER';
  const canManageAppointment = canCloseAppointment || canLeaveAppointment;

  useEffect(() => {
    const hasAccessToken = Boolean(localStorage.getItem('accessToken'));
    if (hasAccessToken || !appointmentId || !appointment?.inviteCode) return;

    const roomPath = ROUTES.ROOM.replace(':appointmentId', appointmentId);
    window.history.pushState({ guestRoomBackGuard: true }, '', roomPath);

    const handlePopState = () => {
      navigate(roomPath, { replace: true });
      window.history.pushState({ guestRoomBackGuard: true }, '', roomPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [appointment?.inviteCode, appointmentId, navigate]);

  if (!appointmentId) return null;

  const handleBack = () => {
    const hasAccessToken = Boolean(localStorage.getItem('accessToken'));
    if (!hasAccessToken && appointment?.inviteCode) {
      navigate(ROUTES.INVITE.replace(':inviteCode', appointment.inviteCode), { replace: true });
      return;
    }
    navigate(ROUTES.HOME);
  };

  const handleShare = () => {
    setIsManageMenuOpen(false);
    const inviteCode = appointment?.inviteCode;
    if (!inviteCode) return;
    const url = `${window.location.origin}${ROUTES.INVITE.replace(':inviteCode', inviteCode)}`;
    if (navigator.share) {
      void navigator.share({ title: appointment.title, url });
    } else {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleCloseAppointment = () => {
    closeAppointment(undefined, {
      onSuccess: () => {
        setIsCloseDialogOpen(false);
        setIsManageMenuOpen(false);
      },
    });
  };

  const handleLeaveAppointment = () => {
    leaveAppointment(undefined, {
      onSuccess: () => {
        setIsLeaveDialogOpen(false);
        setIsManageMenuOpen(false);
        const inviteCode = appointment?.inviteCode;
        const hasAccessToken = Boolean(localStorage.getItem('accessToken'));
        if (!hasAccessToken && inviteCode) {
          navigate(ROUTES.INVITE.replace(':inviteCode', inviteCode));
          return;
        }
        navigate(ROUTES.HOME);
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-canvas-parchment">
      <ConfirmDialog
        isOpen={isCloseDialogOpen}
        title="약속을 종료할까요?"
        description="종료 후에는 위치 공유와 약속 진행 기능을 사용할 수 없습니다."
        confirmLabel={isClosingAppointment ? '종료 중...' : '약속 종료'}
        cancelLabel="취소"
        onConfirm={handleCloseAppointment}
        onCancel={() => setIsCloseDialogOpen(false)}
      />
      <ConfirmDialog
        isOpen={isLeaveDialogOpen}
        title="약속방을 나갈까요?"
        description="나가면 이 약속방 목록과 참여자 목록에서 제외됩니다. 초대 링크가 있으면 다시 참여할 수 있습니다."
        confirmLabel={isLeavingAppointment ? '나가는 중...' : '나가기'}
        cancelLabel="취소"
        onConfirm={handleLeaveAppointment}
        onCancel={() => setIsLeaveDialogOpen(false)}
      />

      {/* 지도 (전체 화면) */}
      <KakaoMap />

      {/* 상단 헤더: 뒤로가기 | 탭 | 초대 공유/약속 관리 */}
      <div className="fixed top-0 inset-x-0 z-20 flex items-start justify-between pt-safe px-4 pointer-events-none">
        {/* 좌상단 — 메인으로 */}
        <button onClick={handleBack} className={`${btnClass} mt-3`} aria-label="이전 화면으로">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* 중앙 — 탭 전환 */}
        <div className="flex mt-3 bg-surface-tile-1/80 backdrop-blur-md rounded-pill p-1 pointer-events-auto shadow-lg">
          <button
            onClick={() => setTab('vote')}
            className={[
              'px-5 py-2 rounded-pill text-sm font-semibold transition-all',
              tab === 'vote' ? 'bg-canvas text-primary shadow-sm' : 'text-on-dark/60',
            ].join(' ')}
          >
            장소 추천
          </button>
          <button
            onClick={() => setTab('location')}
            className={[
              'px-5 py-2 rounded-pill text-sm font-semibold transition-all',
              tab === 'location' ? 'bg-canvas text-primary shadow-sm' : 'text-on-dark/60',
            ].join(' ')}
          >
            위치 공유
          </button>
        </div>

        {/* 우상단 — 초대 링크 공유 / 약속 관리 */}
        <div className="relative mt-3 flex gap-2 pointer-events-auto">
          <button
            onClick={handleShare}
            className={btnClass}
            aria-label="초대 링크 공유"
            disabled={!appointment?.inviteCode}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {canManageAppointment && (
            <button
              type="button"
              onClick={() => setIsManageMenuOpen((prev) => !prev)}
              className={btnClass}
              aria-label="약속 관리"
              aria-expanded={isManageMenuOpen}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          )}
          {copied && (
            <span className="absolute top-10 right-0 whitespace-nowrap text-xs font-medium bg-surface-tile-1/90 text-on-dark px-2 py-1 rounded-md shadow">
              링크 복사됨
            </span>
          )}
          {canManageAppointment && isManageMenuOpen && (
            <div className="absolute right-0 top-11 w-44 rounded-xl border border-hairline bg-canvas p-2 shadow-lg">
              <p className="px-3 py-2 text-xs font-semibold text-ink-muted-48">약속 관리</p>
              {canCloseAppointment && (
                <button
                  type="button"
                  onClick={() => setIsCloseDialogOpen(true)}
                  disabled={isClosingAppointment}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-canvas-parchment disabled:opacity-50"
                >
                  {isClosingAppointment ? '종료 중...' : '약속 종료하기'}
                </button>
              )}
              {canLeaveAppointment && (
                <button
                  type="button"
                  onClick={() => setIsLeaveDialogOpen(true)}
                  disabled={isLeavingAppointment}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-canvas-parchment disabled:opacity-50"
                >
                  {isLeavingAppointment ? '나가는 중...' : '약속방 나가기'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 단일 바텀시트 — 탭에 따라 콘텐츠만 전환 */}
      <BottomSheet snap={snap} onSnapChange={setSnap}>
        {tab === 'vote' ? (
          <PlaceCandidateSheet
            appointmentId={Number(appointmentId)}
            snap={snap}
            onSnapChange={setSnap}
            appointment={appointment}
          />
        ) : (
          <LocationBottomSheet
            appointmentId={Number(appointmentId)}
            snap={snap}
            onSnapChange={setSnap}
            isConfirmed={appointment?.status === 'CONFIRMED'}
            appointment={appointment}
          />
        )}
      </BottomSheet>
    </div>
  );
};

export default RoomVotePage;
