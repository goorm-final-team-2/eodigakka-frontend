import { useState } from 'react';

// [팀 규칙] 타입(Type) 정의가 필요할 땐 직접 선언하거나 'import type' 형식을 써야 빌드 에러가 안 나요!
interface Room {
  id: number;
  title: string;
  date: string;
  location: string;
  members: number;
}

// [팀 규칙] 백엔드가 아직 없으므로 목업 데이터(가짜 데이터)를 사용합니다.
const MOCK_ROOMS: Room[] = [
  { id: 1, title: '강남역 맛집 탐방 모임 🍕', date: '2026-07-12', location: '강남역', members: 4 },
  {
    id: 2,
    title: '코딩 프로젝트 밤샘 파티 💻',
    date: '2026-07-08',
    location: '홍대입구역',
    members: 5,
  },
  {
    id: 3,
    title: '주말 한강 피크닉 갈 사람! 🧺',
    date: '2026-07-15',
    location: '여의나루역',
    members: 3,
  },
];

export default function App() {
  const [rooms] = useState<Room[]>(MOCK_ROOMS);

  return (
    // [디자인 토큰] bg-canvas(흰 배경), text-ink(기본 글자색), font-text(본문 폰트) 적용!
    <div className="w-full min-h-screen bg-canvas text-ink flex flex-col font-text">
      {/* [Safe Area 규칙] 상단 노치를 피하기 위해 pt-safe 적용! */}
      <header className="w-full bg-canvas border-b border-ink-muted-48/20 pt-safe sticky top-0 z-50">
        <div className="h-11 px-lg flex justify-between items-center">
          {/* [타이포그래피] text-tagline(21px), font-bold 적용 */}
          <h1 className="font-display text-tagline font-bold tracking-tight">어디가까</h1>
          {/* [터치 타겟] rounded-pill(둥근 버튼) 토큰 적용 및 최소 44x44px 영역 확보 */}
          <button className="min-w-11 h-8 rounded-pill bg-primary text-canvas text-caption font-semibold px-md active:opacity-70">
            + 새 약속
          </button>
        </div>
      </header>

      {/* [Safe Area 규칙] min-h-content를 주어 상하 바를 제외한 콘텐츠 영역 확보 */}
      <main className="flex-1 min-h-content p-lg flex flex-col gap-md">
        <div className="flex flex-col gap-2xs">
          {/* [타이포그래피] text-display-md(34px), font-bold 적용 */}
          <h2 className="font-display text-display-md font-bold tracking-tight">약속방 목록</h2>
          {/* [디자인 토큰] text-ink-muted-48(회색 글자색) 적용 */}
          <p className="text-caption text-ink-muted-48">
            참여 중인 약속이 총 {rooms.length}개 있습니다.
          </p>
        </div>

        {/* 약속방 리스트 */}
        <div className="flex flex-col gap-sm">
          {rooms.map((room) => (
            // [디자인 토큰] rounded-lg(18px 라운드), p-lg(24px 패딩) 적용!
            // [모바일 규칙] 터치 환경이므로 :hover는 제외하고 active:bg(누를 때 반응) 토큰 사용!
            <div
              key={room.id}
              className="w-full bg-canvas border border-ink-muted-48/30 rounded-lg p-lg flex flex-col gap-sm active:bg-canvas-parchment"
            >
              <div className="flex justify-between items-start gap-sm">
                {/* [타이포그래피] text-body(17px), font-semibold 적용 */}
                <h3 className="font-display text-body font-semibold tracking-tight break-all">
                  {room.title}
                </h3>
                {/* bg-canvas-parchment(아이보리 배경 토큰) 사용 */}
                <span className="text-fine font-medium bg-canvas-parchment text-ink-muted-48 px-xs py-2xs rounded-sm whitespace-nowrap">
                  {room.members}명 참여중
                </span>
              </div>

              {/* 카드 밑부분 정보 */}
              <div className="flex flex-col gap-2xs text-caption text-ink-muted-48">
                <div className="flex items-center gap-xs">
                  <span>📅 일시:</span>
                  <span className="font-medium text-ink">{room.date}</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span>📍 장소:</span>
                  <span className="font-medium text-ink">{room.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* [Safe Area 규칙] pb-safe-nav를 사용해 하단 홈 바 영역 완벽 회피! */}
      <nav className="w-full bg-canvas border-t border-ink-muted-48/20 pb-safe-nav sticky bottom-0 z-50">
        <div className="h-14 flex justify-around items-center text-fine text-ink-muted-48">
          <button className="flex flex-col items-center gap-3xs text-primary font-medium">
            <span>🏠</span>
            <span>홈</span>
          </button>
          <button className="flex flex-col items-center gap-3xs active:text-ink">
            <span>🗺️</span>
            <span>지도공유</span>
          </button>
          <button className="flex flex-col items-center gap-3xs active:text-ink">
            <span>👤</span>
            <span>내정보</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
