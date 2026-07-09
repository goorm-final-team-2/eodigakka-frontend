// 단건 데이터 성공 응답
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 목록 데이터 성공 응답
export interface ApiListResponse<T> {
  data: T[];
  message: string;
}
