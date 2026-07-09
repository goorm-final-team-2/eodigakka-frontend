import { useState } from 'react';
import { useNavigate } from 'react-router';

import AppointmentFormModal from '@/components/appointment/AppointmentFormModal';
import { ROUTES } from '@/constants/routes';
import { useAppointments, useDeleteAppointment } from '@/hooks/useAppointments';

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
          + 새 약속
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
          rooms.map((room) => (
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
              <h3 className="text-base font-bold text-ink mb-1">{room.title}</h3>
              <p className="text-xs text-ink-muted-48 mb-3">
                {room.description ?? '방 설명이 없습니다.'}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-ink-muted-80">
                <span className="bg-canvas-parchment px-2 py-1 rounded-sm">
                  📅 {room.appointmentDate}
                </span>
                <span className="bg-canvas-parchment px-2 py-1 rounded-sm text-primary font-medium">
                  📍 {room.preferredArea}
                </span>
              </div>
              {room.role === 'HOST' && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`"${room.title}" 약속방을 삭제하시겠습니까?`)) {
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
                    className="text-xs text-ink-muted-48 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))
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
