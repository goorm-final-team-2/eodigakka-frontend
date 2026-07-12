import apiClient from './index';

import type { ApiListResponse, ApiResponse } from '@/types/api';
import type {
  Appointment,
  AppointmentCreateRequest,
  AppointmentInviteResponse,
  AppointmentJoinRequest,
  AppointmentMember,
  GuestJoinRequest,
  GuestJoinResponse,
} from '@/types/appointment';

// GET /api/appointments — 약속방 목록
export const getAppointments = () =>
  apiClient.get<ApiResponse<Appointment[]>>('/appointments').then((res) => res.data.data);

// GET /api/appointments/{id} — 약속방 단건 상세
export const getAppointment = (appointmentId: number): Promise<Appointment> =>
  apiClient
    .get<ApiResponse<Appointment>>(`/appointments/${appointmentId}`)
    .then((res) => res.data.data);

// GET /api/appointments/invite/{inviteCode} — 초대 코드로 약속방 정보 조회
export const getAppointmentInvite = (inviteCode: string): Promise<AppointmentInviteResponse> =>
  apiClient
    .get<ApiResponse<AppointmentInviteResponse>>(`/appointments/invite/${inviteCode}`)
    .then((res) => res.data.data);

// GET /api/appointments/{id}/members — 약속방 참여자 목록
export const getMembers = (appointmentId: number) =>
  apiClient
    .get<ApiListResponse<AppointmentMember>>(`/appointments/${appointmentId}/members`)
    .then((res) => res.data.data);

// POST /api/appointments — 약속방 생성
export const createAppointment = (body: AppointmentCreateRequest): Promise<Appointment> =>
  apiClient.post<ApiResponse<Appointment>>('/appointments', body).then((res) => res.data.data);

// POST /api/appointments/join — 약속방 참여 (로그인 유저)
export const joinAppointment = (body: AppointmentJoinRequest): Promise<Appointment> =>
  apiClient.post<ApiResponse<Appointment>>('/appointments/join', body).then((res) => res.data.data);

// POST /api/appointments/guests — 약속방 참여 (게스트)
export const joinAppointmentAsGuest = (body: GuestJoinRequest): Promise<GuestJoinResponse> =>
  apiClient
    .post<ApiResponse<GuestJoinResponse>>('/appointments/guests', body)
    .then((res) => res.data.data);

// DELETE /api/appointments/{id} — 약속방 삭제 (방장 전용)
export const deleteAppointment = (appointmentId: number): Promise<void> =>
  apiClient.delete(`/appointments/${appointmentId}`).then(() => undefined);

// PATCH /api/appointments/{id}/close — 약속 종료 (방장 전용)
export const closeAppointment = (appointmentId: number): Promise<Appointment> =>
  apiClient
    .patch<ApiResponse<Appointment>>(`/appointments/${appointmentId}/close`)
    .then((res) => res.data.data);
