import { useState } from 'react';
import { useNavigate } from 'react-router';

import AppointmentFormModal from '@/components/appointment/AppointmentFormModal';
import { ROUTES } from '@/constants/routes';
import { useAppointments, useDeleteAppointment } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

const statusLabel = {
  PLANNING: '장소 추천 중',
  CONFIRMED: '장소 확정',
  CLOSED: '종료됨',
} as const;

const roleLabel = {
  HOST: '방장',
  MEMBER: '참여자',
} as const;

function formatAppointmentTime(time: string) {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

function getDeleteConfirmMessage(room: Appointment) {
  if (room.status === 'CLOSED') {
    return '종료된 약속방을 삭제할까요? 참여자에게도 더 이상 보이지 않습니다.';
  }

  return '약속방을 삭제할까요? 참여자에게도 더 이상 보이지 않습니다.';
}

export default function App() {
  const { data: rooms = [], isLoading, isError } = useAppointments();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteAppointment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-parchment text-ink-muted-48">
        로딩 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-parchment text-ink-muted-48">
        방 목록을 불러오는데 실패했어요.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-parchment pt-safe pb-safe px-4">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between py-4 border-b border-hairline">
        <h1 className="font-display text-2xl font-bold text-primary">어디가까</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-3 py-1.5 rounded-pill text-sm font-medium shadow-sm transition-all active:scale-95"
        >
          + 약속 만들기
        </button>
      </div>

      {/* 약속 개수 */}
      <div className="mt-6 mb-4">
        <h2 className="text-lg font-semibold text-ink">
          약속방 목록{' '}
          <span className="text-sm font-normal text-ink-muted-48">
            (참여 중인 약속이 총 {rooms.length}개 있습니다.)
          </span>
        </h2>
      </div>

      {/* 약속방 카드 목록 */}
      <div className="space-y-4">
        {rooms.length === 0 ? (
          <p className="text-center text-ink-muted-48 py-10 text-sm">
            아직 참여 중인 약속방이 없습니다.
          </p>
        ) : (
          rooms.map((room) => {
            const canDeleteRoom =
              room.role === 'HOST' && (room.status === 'PLANNING' || room.status === 'CLOSED');
            const shouldShowCloseBeforeDeleteNotice =
              room.role === 'HOST' && room.status === 'CONFIRMED';
            const shouldShowClosedNotice = room.status === 'CLOSED';

            return (
              <div
                key={room.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(ROUTES.ROOM.replace(':appointmentId', String(room.id)))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    navigate(ROUTES.ROOM.replace(':appointmentId', String(room.id)));
                }}
                className="bg-canvas p-5 rounded-lg shadow-sm border border-hairline transition-all active:scale-95 cursor-pointer"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-ink truncate">{room.title}</h3>
                    <p className="mt-1 text-xs text-ink-muted-48 line-clamp-2">
                      {room.description ?? '약속 설명이 없습니다.'}
                    </p>
                  </div>
                  <span className="flex-none whitespace-nowrap rounded-pill bg-canvas-parchment px-3 py-1.5 text-xs font-semibold text-primary">
                    {statusLabel[room.status]}
                  </span>
                </div>

                <div className="grid gap-2 text-xs text-ink-muted-80">
                  <div className="flex items-center gap-2 rounded-sm bg-canvas-parchment px-3 py-2">
                    <span>📅</span>
                    <span className="font-medium text-ink">
                      {room.appointmentDate} {formatAppointmentTime(room.appointmentTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-sm bg-canvas-parchment px-3 py-2">
                    <span>📍</span>
                    <span className="font-medium text-primary">
                      {room.preferredArea ?? '선호 지역 미정'}
                    </span>
                  </div>
                  {room.notice && (
                    <div className="flex items-start gap-2 rounded-sm bg-canvas-parchment px-3 py-2">
                      <span className="font-semibold text-ink-muted-48">공지</span>
                      <span className="line-clamp-2">{room.notice}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-pill border border-hairline px-2 py-1 text-ink-muted-48">
                    {roleLabel[room.role]}
                  </span>
                  <span className="font-semibold text-primary">약속방 보기 →</span>
                </div>

                {(shouldShowCloseBeforeDeleteNotice || shouldShowClosedNotice || canDeleteRoom) && (
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3 text-xs">
                    <p className="min-w-0 text-ink-muted-48">
                      {shouldShowCloseBeforeDeleteNotice && '삭제하려면 먼저 약속을 종료하세요.'}
                      {shouldShowClosedNotice &&
                        '종료된 약속입니다. 필요하면 방장이 삭제할 수 있습니다.'}
                    </p>
                    {canDeleteRoom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(getDeleteConfirmMessage(room))) {
                            deleteRoom(room.id, {
                              onError: (err) => {
                                const msg =
                                  (err as { response?: { data?: { message?: string } } })?.response
                                    ?.data?.message ?? '약속방 삭제에 실패했습니다.';
                                alert(msg);
                              },
                            });
                          }
                        }}
                        disabled={isDeleting}
                        className="flex-none text-xs text-ink-muted-48 hover:text-primary transition-colors disabled:opacity-40"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* key를 isModalOpen으로 설정 → 닫힐 때 컴포넌트 리셋 */}
      <AppointmentFormModal
        key={String(isModalOpen)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
