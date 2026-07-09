import { useEffect, useRef, useState } from 'react';

import { useDeleteCandidate } from '@/hooks/useCandidates';
import { useToggleVote } from '@/hooks/useVotes';
import type { PlaceCandidateResponse } from '@/types/place';
import type { VoteResult } from '@/types/vote';

type CandidateItemProps = {
  candidate: PlaceCandidateResponse;
  rank: number;
  voteResult: VoteResult | undefined;
  appointmentId: number;
  isHost: boolean;
  isConfirmed: boolean;
  isTopVoted: boolean;
  isConfirmedCandidate: boolean;
  onConfirm: (placeCandidateId: number) => void;
};

const REVEAL_WIDTH = 80;
const SWIPE_THRESHOLD = 50;
type SwipeState = 'closed' | 'left' | 'right'; // left=삭제 노출, right=여기가자 노출

const CandidateItem = ({
  candidate: c,
  rank,
  voteResult,
  appointmentId,
  isHost,
  isConfirmed,
  isTopVoted,
  isConfirmedCandidate,
  onConfirm,
}: CandidateItemProps) => {
  const { mutate: toggleVote, isPending } = useToggleVote(appointmentId);
  const { mutate: deleteCandidate, isPending: isDeleting } = useDeleteCandidate(appointmentId);

  const votedByMe = voteResult?.votedByMe ?? false;
  const voteCount = voteResult?.voteCount ?? 0;

  const cardRef = useRef<HTMLDivElement>(null);
  const swipeStateRef = useRef<SwipeState>('closed');
  const [swipeState, setSwipeState] = useState<SwipeState>('closed');
  const deleteCandidateRef = useRef(deleteCandidate);
  const toggleVoteRef = useRef(toggleVote);

  const [showConfirm, setShowConfirm] = useState(false);
  const isHostRef = useRef(isHost);
  const isConfirmedRef = useRef(isConfirmed);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    deleteCandidateRef.current = deleteCandidate;
  }, [deleteCandidate]);
  useEffect(() => {
    toggleVoteRef.current = toggleVote;
  }, [toggleVote]);
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);
  useEffect(() => {
    isConfirmedRef.current = isConfirmed;
  }, [isConfirmed]);

  // 투표 가능 여부 (확정 전이면 모두 스와이프 가능)
  const voteSwipeable = !isConfirmed;
  const deleteSwipeable = isHost && !isConfirmed;

  const snapTo = (x: number) => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.2s ease';
    cardRef.current.style.transform = `translateX(${x}px)`;
  };

  const close = () => {
    snapTo(0);
    swipeStateRef.current = 'closed';
    setSwipeState('closed');
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card || (!voteSwipeable && !deleteSwipeable)) return;

    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let isHorizontal: boolean | null = null;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0;
      // 롱프레스 타이머 시작 (방장 + 미확정일 때만)
      if (isHostRef.current && !isConfirmedRef.current) {
        longPressTimer.current = setTimeout(() => {
          setShowConfirm(true);
        }, 500);
      }
      isHorizontal = null;
      card.style.transition = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // 조금이라도 움직이면 롱프레스 취소
      if ((Math.abs(dx) > 5 || Math.abs(dy) > 5) && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isHorizontal === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
      }
      if (!isHorizontal) return;

      e.preventDefault();
      e.stopPropagation();
      deltaX = dx;

      const state = swipeStateRef.current;
      const baseX = state === 'left' ? -REVEAL_WIDTH : state === 'right' ? REVEAL_WIDTH : 0;
      const newX =
        state === 'left'
          ? Math.min(0, Math.max(-REVEAL_WIDTH, baseX + dx)) // 열린 상태: 왼쪽만
          : state === 'right'
            ? Math.max(0, Math.min(REVEAL_WIDTH, baseX + dx)) // 열린 상태: 오른쪽만
            : Math.min(
                deleteSwipeable ? REVEAL_WIDTH : 0,
                Math.max(voteSwipeable ? -REVEAL_WIDTH : 0, dx),
              );
      card.style.transform = `translateX(${newX}px)`;
    };

    const onTouchEnd = () => {
      // 롱프레스 타이머 정리
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      if (!isHorizontal) return;
      const state = swipeStateRef.current;

      if (state === 'closed') {
        if (deltaX < -SWIPE_THRESHOLD && deleteSwipeable) {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = `translateX(-${REVEAL_WIDTH}px)`;
          swipeStateRef.current = 'left';
          setSwipeState('left');
        } else if (deltaX > SWIPE_THRESHOLD && voteSwipeable) {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = `translateX(${REVEAL_WIDTH}px)`;
          swipeStateRef.current = 'right';
          setSwipeState('right');
        } else {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = 'translateX(0)';
        }
      } else if (state === 'left') {
        if (deltaX < -SWIPE_THRESHOLD) {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = `translateX(-${REVEAL_WIDTH * 4}px)`;
          deleteCandidateRef.current(c.id);
        } else if (deltaX > SWIPE_THRESHOLD) {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = 'translateX(0)';
          swipeStateRef.current = 'closed';
          setSwipeState('closed');
        } else {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = `translateX(-${REVEAL_WIDTH}px)`;
        }
      } else {
        // state === 'right'
        if (deltaX > SWIPE_THRESHOLD) {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = `translateX(${REVEAL_WIDTH * 4}px)`;
          toggleVoteRef.current({ placeCandidateId: c.id });
          setTimeout(() => {
            card.style.transition = 'transform 0.2s ease';
            card.style.transform = 'translateX(0)';
            swipeStateRef.current = 'closed';
            setSwipeState('closed');
          }, 200);
        } else if (deltaX < -SWIPE_THRESHOLD) {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = 'translateX(0)';
          swipeStateRef.current = 'closed';
          setSwipeState('closed');
        } else {
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = `translateX(${REVEAL_WIDTH}px)`;
        }
      }
    };

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove', onTouchMove, { passive: false });
    card.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      card.removeEventListener('touchstart', onTouchStart);
      card.removeEventListener('touchmove', onTouchMove);
      card.removeEventListener('touchend', onTouchEnd);
    };
  }, [voteSwipeable, deleteSwipeable, c.id]);

  return (
    <div className="relative overflow-hidden border-b border-hairline">
      {/* 여기가자 버튼 — 항상 DOM에 존재, 카드 슬라이드 시 자연스럽게 드러남 */}
      {voteSwipeable && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-primary flex items-center justify-center">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              toggleVote({ placeCandidateId: c.id });
              close();
            }}
            className="flex items-center justify-center w-full h-full disabled:opacity-50"
          >
            <span className="text-sm font-semibold text-white">
              {votedByMe ? '취소' : '여기가자'}
            </span>
          </button>
        </div>
      )}
      {/* 삭제 버튼 — 항상 DOM에 존재, 카드 슬라이드 시 자연스럽게 드러남 */}
      {deleteSwipeable && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              snapTo(-REVEAL_WIDTH * 4);
              deleteCandidate(c.id);
            }}
            className="flex flex-col items-center justify-center gap-1 w-full h-full disabled:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            <span className="text-xs font-semibold text-white">삭제</span>
          </button>
        </div>
      )}
      {/* 확정 오버레이 (롱프레스 / 우클릭) */}
      {showConfirm && (
        <div
          role="button"
          tabIndex={0}
          className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-canvas/90"
          onClick={() => setShowConfirm(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowConfirm(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(c.id);
              setShowConfirm(false);
            }}
            className="px-5 py-2 rounded-pill bg-primary text-on-primary text-sm font-bold shadow-md"
          >
            확정
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(false);
            }}
            className="px-4 py-2 rounded-pill border border-hairline text-sm text-ink-muted-48"
          >
            취소
          </button>
        </div>
      )}
      {/* 슬라이드 카드 — bg-canvas로 뒤 버튼 완전히 차단 */}
      <div
        ref={cardRef}
        role={swipeState !== 'closed' ? 'button' : undefined}
        tabIndex={swipeState !== 'closed' ? 0 : undefined}
        onClick={swipeState !== 'closed' ? close : undefined}
        onKeyDown={
          swipeState !== 'closed'
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') close();
              }
            : undefined
        }
        onContextMenu={(e) => {
          if (!isHost || isConfirmed) return;
          e.preventDefault();
          setShowConfirm(true);
        }}
        className="relative z-10 bg-canvas"
      >
        {/* 상태별 배경 틴트 레이어 */}
        <div
          className={`flex items-start gap-3 px-4 py-3 ${
            isConfirmedCandidate
              ? 'bg-primary/10 border-l-2 border-l-primary'
              : isTopVoted
                ? 'bg-primary/5'
                : ''
          }`}
        >
          <span className="flex-none w-6 h-6 mt-0.5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
            {rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
              {isConfirmedCandidate && (
                <span className="flex-none text-xs font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-pill">
                  확정
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted-48 mt-0.5 truncate">
              {c.roadAddress ?? c.address}
            </p>
            {c.category && (
              <p className="text-xs text-ink-muted-48 mt-0.5 truncate">{c.category}</p>
            )}
            <p className="text-xs text-ink-muted-48 mt-1">{voteCount}명 투표</p>
          </div>
          <div className="flex-none flex flex-col items-end gap-1.5 pt-0.5">
            {c.placeUrl && (
              <a
                href={c.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline whitespace-nowrap"
              >
                지도 보기
              </a>
            )}
          </div>
        </div>{' '}
        {/* 틴트 레이어 닫기 */}
      </div>{' '}
      {/* 슬라이드 카드 닫기 */}
    </div>
  );
};

export default CandidateItem;
