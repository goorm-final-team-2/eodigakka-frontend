import { useMemo } from 'react';

import { LocationPermissionPrompt } from './LocationPermissionPrompt';
import { LocationShareToggle } from './LocationShareToggle';
import { ParticipantStatusList } from './ParticipantStatusList';

import type { SnapPoint } from '@/components/common/BottomSheet';
import { useCandidates } from '@/hooks/useCandidates';
import { useConfirmedPlace } from '@/hooks/useConfirmedPlace';
import { useLocationMarkers } from '@/hooks/useLocationMarkers';
import { useLocationShare } from '@/hooks/useLocationShare';
import { useParticipantLocations } from '@/hooks/useParticipantLocations';
import { useRouteDisplay } from '@/hooks/useRouteDisplay';
import { useStompLocation } from '@/hooks/useStompLocation';
import { useAuthStore } from '@/stores/authStore';
import type { Appointment } from '@/types/appointment';
import type { ConfirmedPlace } from '@/types/location';

interface Props {
  appointmentId: number;
  /** @deprecated 내부적으로 계산됩니다. 하위 호환성을 위해 유지. */
  confirmedPlace?: ConfirmedPlace;
  snap: SnapPoint;
  onSnapChange: (snap: SnapPoint) => void;
  isConfirmed?: boolean;
  appointment?: Appointment;
}

export function LocationBottomSheet({
  appointmentId,
  snap,
  onSnapChange,
  isConfirmed = false,
  appointment,
}: Props) {
  const user = useAuthStore((s) => s.user);
  // 확정 장소 API 응답 + 후보 목록 → 좌표 포함 확정 장소 계산
  const { data: confirmedPlaceAPI } = useConfirmedPlace(appointmentId);
  const { data: candidates } = useCandidates(appointmentId);

  const confirmedPlaceCoords = useMemo((): ConfirmedPlace | null => {
    if (!confirmedPlaceAPI || !candidates) return null;
    const candidate = candidates.find((c) => c.id === confirmedPlaceAPI.placeCandidateId);
    if (!candidate) return null;
    return {
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      name: candidate.name,
    };
  }, [confirmedPlaceAPI, candidates]);

  const { isConnected: stompConnected, publish: stompPublish } = useStompLocation(
    appointmentId,
    isConfirmed,
  );

  const { isSharing, permissionStatus, sharingError, toggleSharing, isPending } = useLocationShare(
    appointmentId,
    stompPublish,
  );

  const { participants, isLoading } = useParticipantLocations(
    appointmentId,
    confirmedPlaceCoords ?? undefined,
    isConfirmed,
  );

  // 지도 위 핀 마커 관리 (참여자 + 내 위치 + 확정 장소)
  useLocationMarkers(participants, confirmedPlaceCoords, user?.id);

  // 경로 탐색 + 폴리라인 (CONFIRMED 상태에서만)
  const { routeInfo, isRouteLoading } = useRouteDisplay(isConfirmed ? confirmedPlaceCoords : null);

  const showPermissionPrompt = permissionStatus === 'denied' || permissionStatus === 'unavailable';
  const isClosed = appointment?.status === 'CLOSED';

  const handleToggle = () => {
    if (isClosed) return;
    if (!isSharing && snap === 'hidden') onSnapChange('peek');
    toggleSharing();
  };

  const handleViewOnMap = () => {
    if (!confirmedPlaceCoords) return;
    const { latitude: lat, longitude: lng, name } = confirmedPlaceCoords;
    const label = name ?? '목적지';
    window.open(
      `https://map.kakao.com/link/to/${encodeURIComponent(label)},${lat},${lng}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* 헤더 — 공유 토글 */}
        <div className="flex-none px-4 pt-2 pb-3 border-b border-hairline">
          <LocationShareToggle
            isSharing={isSharing}
            isRealtime={stompConnected}
            isPending={isPending || isClosed}
            onToggle={handleToggle}
          />
          {sharingError && !showPermissionPrompt && (
            <p className="mt-2 text-xs text-ink-muted-48">{sharingError}</p>
          )}
        </div>

        {/* 스크롤 콘텐츠 */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: snap !== 'hidden' ? 'auto' : 'hidden',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          }}
        >
          {isClosed ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-ink">종료된 약속입니다</p>
              <p className="text-xs text-ink-muted-48">
                이 약속의 위치 공유와 진행 기능이 종료되었습니다.
              </p>
            </div>
          ) : !isConfirmed ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-ink">장소 확정 후 이용 가능합니다</p>
              <p className="text-xs text-ink-muted-48">
                장소 추천 탭에서 장소를 확정하면 위치 공유가 활성화됩니다.
              </p>
            </div>
          ) : showPermissionPrompt ? (
            <LocationPermissionPrompt onRetry={toggleSharing} />
          ) : (
            <div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
                <h2 className="text-sm font-semibold text-ink">참여자</h2>
              </div>
              <div className="px-4">
                <ParticipantStatusList participants={participants} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>

        {/* 지도에서 보기 버튼 — 확정 장소가 있을 때만 표시 */}
        {isConfirmed && confirmedPlaceCoords && !isClosed && (
          <div className="flex-none px-4 py-3 border-t border-hairline">
            <button
              type="button"
              onClick={handleViewOnMap}
              className="w-full py-3 rounded-pill bg-primary text-sm font-semibold text-on-primary active:scale-95 transition-transform"
            >
              {isRouteLoading
                ? '경로 조회 중...'
                : routeInfo
                  ? `${Math.round(routeInfo.duration / 60)}분 · ${(routeInfo.distance / 1000).toFixed(1)}km | 지도에서 보기 →`
                  : `${confirmedPlaceCoords.name ?? '목적지'} 지도에서 보기 →`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
