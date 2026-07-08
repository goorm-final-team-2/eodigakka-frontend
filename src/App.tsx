import { useEffect, useState } from 'react';

// 방 데이터의 타입을 정의해줍니다 (성우님 API 스펙 기준)
interface Room {
  id: number;
  title: string;
  appointmentDate: string;
  preferredArea: string;
  description?: string;
}

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 백엔드 개발 서버 URL로 요청을 보냅니다.
    // 쿠키 인증을 위해 credentials: "include" 설정을 유지합니다.
    fetch('https://api.eodigakka.xyz/api/appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('방 목록을 불러오는데 실패했어요.');
        }
        return res.json();
      })
      .then((response) => {
        // 성우님 공통 응답 포맷인 { data: [...] } 구조에 맞춰 데이터를 넣어줍니다.
        if (response.data) {
          setRooms(response.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-safe pb-safe px-4">
      {/* 상단 헤더 영역 */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-500">어디가까</h1>
        <button className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-orange-600 transition">
          + 새 약속
        </button>
      </div>

      {/* 타이틀 및 개수 표시 */}
      <div className="mt-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          약속방 목록{' '}
          <span className="text-sm font-normal text-gray-500">
            (참여 중인 약속이 총 {rooms.length}개 있습니다.)
          </span>
        </h2>
      </div>

      {/* 약속방 목록 카드 리스트 */}
      <div className="space-y-4">
        {rooms.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            아직 참여 중인 약속방이 없습니다.
          </p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{room.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {room.description || '방 설명이 없습니다.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">
                      📅 {room.appointmentDate}
                    </span>
                    <span className="bg-orange-50 px-2 py-1 rounded-md text-orange-600 font-medium">
                      📍 {room.preferredArea}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
