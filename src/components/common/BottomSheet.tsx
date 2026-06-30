import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

export type SnapPoint = 'hidden' | 'peek' | 'partial' | 'full';

type BottomSheetProps = {
  snap: SnapPoint;
  onSnapChange: (snap: SnapPoint) => void;
  children: ReactNode;
};

const HIDDEN_PEEK_PX = 36;
const SNAP_ORDER: SnapPoint[] = ['hidden', 'peek', 'partial', 'full'];
const TAP_MAX_MOVE = 8;
const VELOCITY_THRESHOLD = 0.3;

const SNAP_HEIGHT_PCT: Record<SnapPoint, number> = {
  hidden: 0, // HIDDEN_PEEK_PX로 덮어씀
  peek: 25,
  partial: 50,
  full: 92,
};

function getSnapHeight(s: SnapPoint): string {
  if (s === 'hidden') return `${HIDDEN_PEEK_PX}px`;
  return `${SNAP_HEIGHT_PCT[s]}dvh`;
}

function getSnapHeightPx(s: SnapPoint): number {
  if (s === 'hidden') return HIDDEN_PEEK_PX;
  return (window.innerHeight * SNAP_HEIGHT_PCT[s]) / 100;
}

const BottomSheet = ({ snap, onSnapChange, children }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<SnapPoint>(snap);
  useLayoutEffect(() => {
    snapRef.current = snap;
  });

  // snap prop 변경 시 애니메이션으로 높이 조정
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
    el.style.height = getSnapHeight(snap);
  }, [snap]);

  const snapTo = useCallback(
    (next: SnapPoint) => {
      const el = sheetRef.current;
      if (el) {
        el.style.transition = 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
        el.style.height = getSnapHeight(next);
      }
      if (next !== snapRef.current) onSnapChange(next);
    },
    [onSnapChange],
  );

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    let startY = 0;
    let lastY = 0;
    let lastTime = 0;
    let startSnap: SnapPoint = snapRef.current;
    let maxMove = 0;
    let isDragging = false;

    const onDragStart = (clientY: number) => {
      startY = clientY;
      lastY = clientY;
      lastTime = Date.now();
      startSnap = snapRef.current;
      maxMove = 0;
      isDragging = true;
      const el = sheetRef.current;
      if (el) el.style.transition = 'none';
    };

    const onDragMove = (clientY: number, e: Event) => {
      e.preventDefault();
      const dy = clientY - startY; // 양수 = 아래로 드래그 = 높이 감소
      maxMove = Math.max(maxMove, Math.abs(dy));
      lastY = clientY;
      lastTime = Date.now();

      const el = sheetRef.current;
      if (!el) return;

      const baseHeightPx = getSnapHeightPx(startSnap);
      const newHeightPx = Math.max(
        HIDDEN_PEEK_PX,
        Math.min(window.innerHeight * 0.96, baseHeightPx - dy),
      );
      el.style.height = `${newHeightPx}px`;
    };

    const onDragEnd = (clientY: number) => {
      isDragging = false;
      const dy = clientY - startY;

      if (maxMove <= TAP_MAX_MOVE) {
        if (snapRef.current === 'hidden') snapTo('peek');
        return;
      }

      const currentIndex = SNAP_ORDER.indexOf(startSnap);
      const dt = Math.max(1, Date.now() - lastTime);
      const velocity = (clientY - lastY) / dt;

      const DRAG_THRESHOLD = 40;
      let targetIndex = currentIndex;

      if (velocity > VELOCITY_THRESHOLD || dy > DRAG_THRESHOLD) {
        targetIndex = Math.max(0, currentIndex - 1); // 아래로 → 축소
      } else if (velocity < -VELOCITY_THRESHOLD || dy < -DRAG_THRESHOLD) {
        targetIndex = Math.min(SNAP_ORDER.length - 1, currentIndex + 1); // 위로 → 확장
      }

      snapTo(SNAP_ORDER[targetIndex]);
    };

    const onTouchStart = (e: globalThis.TouchEvent) => onDragStart(e.touches[0].clientY);
    const onTouchMove = (e: globalThis.TouchEvent) => onDragMove(e.touches[0].clientY, e);
    const onTouchEnd = (e: globalThis.TouchEvent) => onDragEnd(e.changedTouches[0].clientY);

    const onMouseDown = (e: globalThis.MouseEvent) => onDragStart(e.clientY);
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging) return;
      onDragMove(e.clientY, e);
    };
    const onMouseUp = (e: globalThis.MouseEvent) => {
      if (!isDragging) return;
      onDragEnd(e.clientY);
    };

    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    handle.addEventListener('touchmove', onTouchMove, { passive: false });
    handle.addEventListener('touchend', onTouchEnd, { passive: true });
    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      handle.removeEventListener('touchstart', onTouchStart);
      handle.removeEventListener('touchmove', onTouchMove);
      handle.removeEventListener('touchend', onTouchEnd);
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [snapTo]);

  return (
    <div
      ref={sheetRef}
      className="fixed inset-x-0 bottom-0 z-10 flex flex-col bg-canvas rounded-t-2xl"
      style={{
        height: getSnapHeight(snap),
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        willChange: 'height',
      }}
    >
      {/* 드래그 핸들 */}
      <div
        ref={handleRef}
        className="flex-none flex justify-center items-center h-9 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className="w-10 h-1 rounded-pill bg-hairline" />
      </div>

      {/* 콘텐츠 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
