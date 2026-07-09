import { useState } from 'react';

import { LocationPermissionPrompt } from './LocationPermissionPrompt';
import { LocationShareToggle } from './LocationShareToggle';
import { ParticipantStatusList } from './ParticipantStatusList';

import { useLocationShare } from '@/hooks/useLocationShare';
import { useParticipantLocations } from '@/hooks/useParticipantLocations';
import { useStompLocation } from '@/hooks/useStompLocation';
import type { ConfirmedPlace } from '@/types/location';

interface Props {
  appointmentId: number;
  confirmedPlace?: ConfirmedPlace;
}

export function LocationBottomSheet({ appointmentId, confirmedPlace }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // STOMP 연결 관리 — publish 함수를 useLocationShare에 전달
  const { isConnected: stompConnected, publish: stompPublish } = useStompLocation(appointmentId);

  const { isSharing, permissionStatus, sharingError, toggleSharing, isPending } = useLocationShare(
    appointmentId,
    stompPublish,
  );

  const { participants, isLoading } = useParticipantLocations(appointmentId, confirmedPlace);

  const showPermissionPrompt = permissionStatus === 'denied' || permissionStatus === 'unavailable';

  const handleToggle = () => {
    if (!isSharing && !isExpanded) setIsExpanded(true);
    toggleSharing();
  };

  return (
    /*
     * 바텀시트 컨테이너
     * - 높이: 60dvh 고정
     * - 접힘: translateY로 상단 72px(핸들+헤더)만 노출
     * - 펼침: translateY(0)
     */
    <div
      className={[
        'fixed bottom-0 inset-x-0 z-10',
        'flex flex-col',
        'bg-surface-tile-1/95 backdrop-blur-xl',
        'border-t border-white/10 rounded-t-[20px]',
        'transition-transform duration-300 ease-out',
        'pb-safe',
      ].join(' ')}
      style={{
        height: '60dvh',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 72px))',
      }}
    >
      {/* 핸들 바 — 탭하면 펼침/접힘 토글 */}
      <button
        aria-label={isExpanded ? '시트 접기' : '시트 펼치기'}
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex justify-center pt-xs pb-sm flex-shrink-0"
      >
        <span className="w-9 h-1 rounded-pill bg-white/30" />
      </button>

      {/* 헤더 영역 — 위치 공유 토글 */}
      <div className="px-lg pb-md flex-shrink-0">
        <LocationShareToggle
          isSharing={isSharing}
          isRealtime={stompConnected}
          isPending={isPending}
          onToggle={handleToggle}
        />

        {/* 일반 오류 메시지 (권한 거부 화면은 별도 처리) */}
        {sharingError && !showPermissionPrompt && (
          <p className="mt-sm text-fine text-body-muted leading-snug">{sharingError}</p>
        )}
      </div>

      {/* 구분선 */}
      <div className="h-px bg-white/10 flex-shrink-0" />

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-lg">
        {showPermissionPrompt ? (
          <LocationPermissionPrompt onRetry={toggleSharing} />
        ) : (
          <>
            <p className="text-fine text-body-muted pt-md pb-xs">참여자</p>
            <ParticipantStatusList participants={participants} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
