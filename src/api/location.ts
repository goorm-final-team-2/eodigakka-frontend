import apiClient from './index';

import type { ApiListResponse } from '@/types/api';
import type { LocationCoords, ParticipantLocation } from '@/types/location';

// PUT /api/appointments/{id}/locations/me — 내 위치 공유/갱신 (upsert)
export function sendLocation(appointmentId: number, coords: LocationCoords) {
  return apiClient
    .put<void>(`/appointments/${appointmentId}/locations/me`, coords)
    .then((res) => res.data);
}

// GET /api/appointments/{id}/locations — 위치를 공유 중인 참여자 목록
export function getLocations(appointmentId: number) {
  return apiClient
    .get<ApiListResponse<ParticipantLocation>>(`/appointments/${appointmentId}/locations`)
    .then((res) => res.data.data);
}
