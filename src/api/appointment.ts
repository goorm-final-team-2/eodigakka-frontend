import apiClient from '@/api/index';
import type { Appointment } from '@/types/appointment';

type ApiResponse<T> = { data: T; message: string };

export const getAppointments = () =>
  apiClient.get<ApiResponse<Appointment[]>>('/appointments').then((res) => res.data.data);
