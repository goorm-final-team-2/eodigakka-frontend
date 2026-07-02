import apiClient from './index';

import type { ApiResponse } from '@/types/api';
import type { Appointment } from '@/types/appointment';

export const getAppointment = (appointmentId: number): Promise<Appointment> =>
  apiClient
    .get<ApiResponse<Appointment>>(`/appointments/${appointmentId}`)
    .then((res) => res.data.data);
