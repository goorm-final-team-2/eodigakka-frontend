export type ArrivalStatus = '도착 근처' | '이동 중' | '미공유';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ConfirmedPlace {
  latitude: number;
  longitude: number;
  name?: string;
}

// GET /api/appointments/{id}/locations 응답 항목
export interface ParticipantLocation {
  appointmentId: number;
  memberId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt: string;
}

// 멤버 정보 + 위치 정보 + 도착 상태를 합친 UI 표시용 타입
export interface ParticipantLocationWithStatus {
  memberId: number;
  memberType: 'USER' | 'GUEST';
  nickname: string;
  profileImage: string | null;
  role: 'HOST' | 'MEMBER';
  latitude: number | null;
  longitude: number | null;
  updatedAt: string | null;
  arrivalStatus: ArrivalStatus;
}
