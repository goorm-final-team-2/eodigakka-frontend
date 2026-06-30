import apiClient from './index';

import type { ApiResponse } from '@/types/api';
import type { PlaceCandidateRequest, PlaceCandidateResponse } from '@/types/place';

export const addCandidate = (
  appointmentId: number,
  body: PlaceCandidateRequest,
): Promise<PlaceCandidateResponse> =>
  apiClient
    .post<
      ApiResponse<PlaceCandidateResponse>
    >(`/appointments/${appointmentId}/place-candidates`, body)
    .then((res) => res.data.data);

export const getCandidates = (appointmentId: number): Promise<PlaceCandidateResponse[]> =>
  apiClient
    .get<ApiResponse<PlaceCandidateResponse[]>>(`/appointments/${appointmentId}/place-candidates`)
    .then((res) => res.data.data);

export const deleteCandidate = (appointmentId: number, placeCandidateId: number): Promise<void> =>
  apiClient
    .delete(`/appointments/${appointmentId}/place-candidates/${placeCandidateId}`)
    .then(() => undefined);
