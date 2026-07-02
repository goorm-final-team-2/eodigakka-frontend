import axios from 'axios';

import apiClient from './index';

import type { ApiResponse } from '@/types/api';
import type { ConfirmPlaceRequest, ConfirmedPlace } from '@/types/confirmed';

export const getConfirmedPlace = (appointmentId: number): Promise<ConfirmedPlace | null> =>
  apiClient
    .get<ApiResponse<ConfirmedPlace>>(`/appointments/${appointmentId}/confirmed-place`)
    .then((res) => res.data.data)
    .catch((err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    });

export const confirmPlace = (
  appointmentId: number,
  body: ConfirmPlaceRequest,
): Promise<ConfirmedPlace> =>
  apiClient
    .put<ApiResponse<ConfirmedPlace>>(`/appointments/${appointmentId}/confirmed-place`, body)
    .then((res) => res.data.data);
