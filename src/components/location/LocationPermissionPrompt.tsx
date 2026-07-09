interface Props {
  onRetry: () => void;
}

export function LocationPermissionPrompt({ onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-md px-lg py-xl text-center">
      {/* 아이콘 */}
      <div className="w-14 h-14 rounded-full bg-canvas-parchment flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-muted-48"
          aria-hidden="true"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>

      <div>
        <p className="text-body-strong font-semibold text-ink">위치 권한이 필요합니다</p>
        <p className="text-fine text-ink-muted-48 mt-xs leading-relaxed">
          위치 공유를 사용하려면 브라우저 위치 권한을 허용해야 합니다.
          <br />
          설정 {'>'} 개인정보 보호 {'>'} 위치 서비스에서 변경해주세요.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="mt-xxs px-lg h-10 rounded-pill bg-primary text-on-primary text-caption-strong font-semibold"
      >
        다시 시도
      </button>
    </div>
  );
}
