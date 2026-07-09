import apiClient from './index';

import type { ApiListResponse, ApiResponse } from '@/types/api';
import type { Appointment, AppointmentMember } from '@/types/appointment';

// GET /api/appointments — 약속방 목록
export const getAppointments = () =>
  apiClient.get<ApiResponse<Appointment[]>>('/appointments').then((res) => res.data.data);

// GET /api/appointments/{id} — 약속방 단건 상세
export const getAppointment = (appointmentId: number): Promise<Appointment> =>
  apiClient
    .get<ApiResponse<Appointment>>(`/appointments/${appointmentId}`)
    .then((res) => res.data.data);

// GET /api/appointments/{id}/members — 약속방 참여자 목록
export const getMembers = (appointmentId: number) =>
  apiClient
    .get<ApiListResponse<AppointmentMember>>(`/appointments/${appointmentId}/members`)
    .then((res) => res.data.data);
