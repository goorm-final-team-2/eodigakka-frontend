import { useAppointments } from '@/hooks/useAppointments';

export default function App() {
  const { data: rooms = [], isLoading, isError } = useAppointments();

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
        <button className="bg-primary text-on-primary px-3 py-1.5 rounded-pill text-sm font-medium shadow-sm transition-all active:scale-95">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
