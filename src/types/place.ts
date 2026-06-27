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
