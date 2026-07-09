import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import BottomSheet, { type SnapPoint } from '@/components/common/BottomSheet';
import { LocationBottomSheet } from '@/components/location/LocationBottomSheet';
import KakaoMap from '@/components/map/KakaoMap';
import PlaceCandidateSheet from '@/components/vote/PlaceCandidateSheet';
import { ROUTES } from '@/constants/routes';
import { useAppointment } from '@/hooks/useAppointment';

type Tab = 'vote' | 'location';

const btnClass =
  'flex items-center justify-center w-9 h-9 rounded-full bg-surface-tile-1/80 backdrop-blur-md text-on-dark shadow-lg transition-all active:scale-95 pointer-events-auto';

const RoomVotePage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [snap, setSnap] = useState<SnapPoint>('hidden');
  const [tab, setTab] = useState<Tab>('vote');
  const [copied, setCopied] = useState(false);

  const { data: appointment } = useAppointment(Number(appointmentId));

  if (!appointmentId) return null;

  const handleShare = () => {
    const inviteCode = appointment?.inviteCode;
    if (!inviteCode) return;
    const url = `${window.location.origin}/?invite=${inviteCode}`;
    if (navigator.share) {
      void navigator.share({ title: appointment.title, url });
    } else {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-canvas-parchment">
      {/* 지도 (전체 화면) */}
      <KakaoMap />

      {/* 상단 헤더: 뒤로가기 | 탭 | 초대 공유 */}
      <div className="fixed top-0 inset-x-0 z-20 flex items-start justify-between pt-safe px-4 pointer-events-none">
        {/* 좌상단 — 메인으로 */}
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className={`${btnClass} mt-3`}
          aria-label="메인으로"
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

        {/* 우상단 — 초대 링크 공유 */}
        <div className="relative mt-3">
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
          {copied && (
            <span className="absolute top-10 right-0 whitespace-nowrap text-xs font-medium bg-surface-tile-1/90 text-on-dark px-2 py-1 rounded-md shadow">
              링크 복사됨
            </span>
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
          />
        )}
      </BottomSheet>
    </div>
  );
};

export default RoomVotePage;
