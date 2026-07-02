import { useState } from 'react';
import { useParams } from 'react-router';

import BottomSheet, { type SnapPoint } from '@/components/common/BottomSheet';
import KakaoMap from '@/components/map/KakaoMap';
import PlaceCandidateSheet from '@/components/vote/PlaceCandidateSheet';
import { useAppointment } from '@/hooks/useAppointment';

const RoomVotePage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [snap, setSnap] = useState<SnapPoint>('hidden');

  const { data: appointment } = useAppointment(Number(appointmentId));

  if (!appointmentId) return null;

  return (
    <div className="fixed inset-0 bg-canvas-parchment">
      {/* 지도 (전체 화면) */}
      <KakaoMap />

      {/* 바텀시트 */}
      <BottomSheet snap={snap} onSnapChange={setSnap}>
        <PlaceCandidateSheet
          appointmentId={Number(appointmentId)}
          snap={snap}
          onSnapChange={setSnap}
          appointment={appointment}
        />
      </BottomSheet>
    </div>
  );
};

export default RoomVotePage;
