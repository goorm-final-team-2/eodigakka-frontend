import type { ArrivalStatus, ParticipantLocationWithStatus } from '@/types/location';

interface Props {
  participant: ParticipantLocationWithStatus;
}

function statusDotClass(status: ArrivalStatus): string {
  switch (status) {
    case '도착 근처':
      return 'bg-status-arrived';
    case '이동 중':
      return 'bg-primary';
    case '미공유':
      return 'bg-ink-muted-48';
  }
}

export function ParticipantStatusItem({ participant }: Props) {
  const initial = participant.nickname.charAt(0);

  return (
    <li className="flex items-center gap-sm py-xs">
      {/* 아바타 */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-canvas-parchment flex items-center justify-center">
        <span className="text-body-strong font-semibold text-ink">{initial}</span>
      </div>

      {/* 닉네임 */}
      <span className="flex-1 text-body text-ink truncate">{participant.nickname}</span>

      {/* 도착 상태 */}
      <div className="flex items-center gap-xxs flex-shrink-0">
        <span className={`w-2 h-2 rounded-full ${statusDotClass(participant.arrivalStatus)}`} />
        <span className="text-fine text-ink-muted-48">{participant.arrivalStatus}</span>
      </div>
    </li>
  );
}
