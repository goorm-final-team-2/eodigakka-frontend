interface Props {
  isSharing: boolean;
  isRealtime: boolean;
  isPending: boolean;
  onToggle: () => void;
}

function sharingSubtitle(isSharing: boolean, isRealtime: boolean): string {
  if (!isSharing) return '켜면 모임 참여자들과 위치가 공유됩니다';
  return isRealtime ? '공유 중 · 실시간' : '공유 중 · 10초마다 업데이트';
}

export function LocationShareToggle({ isSharing, isRealtime, isPending, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between gap-md">
      <div className="min-w-0">
        <p className="text-body-strong font-semibold text-on-dark">위치 공유</p>
        <p className="text-fine text-body-muted mt-[2px] leading-snug">
          {sharingSubtitle(isSharing, isRealtime)}
        </p>
      </div>

      {/* iOS 스타일 토글 — 51×31px */}
      <button
        role="switch"
        aria-checked={isSharing}
        aria-label={isSharing ? '위치 공유 끄기' : '위치 공유 켜기'}
        disabled={isPending}
        onClick={onToggle}
        className={[
          'relative flex-shrink-0 w-[51px] h-[31px] rounded-pill',
          'transition-colors duration-200 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2',
          isSharing ? 'bg-primary' : 'bg-surface-chip',
          isPending ? 'opacity-50' : '',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-canvas',
            'shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform duration-200',
            isSharing ? 'translate-x-[20px]' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
