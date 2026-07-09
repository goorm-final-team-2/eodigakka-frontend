import apiClient from './index';

import type { ApiListResponse } from '@/types/api';
import type { AppointmentMember } from '@/types/appointment';

// GET /api/appointments/{id}/members — 약속방 참여자 목록
export function getMembers(appointmentId: number) {
  return apiClient
    .get<ApiListResponse<AppointmentMember>>(`/appointments/${appointmentId}/members`)
    .then((res) => res.data.data);
}
