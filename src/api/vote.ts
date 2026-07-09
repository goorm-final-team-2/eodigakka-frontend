import apiClient from './index';

import type { ApiResponse } from '@/types/api';
import type { ToggleVoteRequest, VoteResult } from '@/types/vote';

export const getVoteResults = (appointmentId: number): Promise<VoteResult[]> =>
  apiClient
    .get<ApiResponse<VoteResult[]>>(`/appointments/${appointmentId}/votes/results`)
    .then((res) => res.data.data);

export const toggleVote = (appointmentId: number, body: ToggleVoteRequest): Promise<void> =>
  apiClient
    .put<ApiResponse<null>>(`/appointments/${appointmentId}/votes`, body)
    .then(() => undefined);
