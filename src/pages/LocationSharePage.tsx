import { useState } from 'react';
import { useParams } from 'react-router';

import BottomSheet, { type SnapPoint } from '@/components/common/BottomSheet';
import { LocationBottomSheet } from '@/components/location/LocationBottomSheet';

/*
 * 위치 공유 페이지
 *
 * 레이아웃:
 *   ┌───────────────────────┐
 *   │  지도 영역 (전체 화면)  │  ← 이홍섭 팀원이 카카오맵으로 채울 슬롯
 *   │                       │
 *   ├───────────────────────┤
 *   │  위치 공유 바텀시트    │  ← 이 컴포넌트가 담당
 *   └───────────────────────┘
 *
 * confirmedPlace: 약속 상세 API 연동 후 실제 확정 장소 좌표로 교체할 것
 */
export function LocationSharePage() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const [snap, setSnap] = useState<SnapPoint>('peek');

  // TODO: 약속 상세 훅 연동 후 실제 confirmedPlace 데이터로 교체
  const confirmedPlace = undefined;

  return (
    <div className="relative h-dvh overflow-hidden bg-surface-black">
      {/* 지도 슬롯 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-sm">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-muted-48"
          aria-hidden="true"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <p className="text-fine text-ink-muted-48">지도 영역 — 카카오맵 연동 예정</p>
      </div>

      <BottomSheet snap={snap} onSnapChange={setSnap}>
        <LocationBottomSheet
          appointmentId={appointmentId}
          confirmedPlace={confirmedPlace}
          snap={snap}
          onSnapChange={setSnap}
        />
      </BottomSheet>
    </div>
  );
}
