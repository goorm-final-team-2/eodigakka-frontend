// 카카오 Local API / services.Places 검색 결과 타입
export type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string;
  distance: string;
};

// 백엔드 API 타입

export type PlaceCandidateRequest = {
  kakaoPlaceId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  roadAddress?: string;
  category?: string;
  placeUrl?: string;
  phone?: string;
};

export type PlaceCandidateResponse = {
  id: number;
  appointmentId: number;
  kakaoPlaceId: string;
  name: string;
  address: string;
  roadAddress: string | null;
  category: string | null;
  placeUrl: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  addedByMemberId: number;
  createdAt: string;
};
