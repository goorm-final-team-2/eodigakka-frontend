import { ParticipantStatusItem } from './ParticipantStatusItem';

import type { ParticipantLocationWithStatus } from '@/types/location';

interface Props {
  participants: ParticipantLocationWithStatus[];
  isLoading: boolean;
}

export function ParticipantStatusList({ participants, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-fine text-body-muted">위치 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-fine text-body-muted">참여자 위치 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/10">
      {participants.map((p) => (
        <ParticipantStatusItem key={p.memberId} participant={p} />
      ))}
    </ul>
  );
}
