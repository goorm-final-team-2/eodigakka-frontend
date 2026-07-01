import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getVoteResults, toggleVote } from '@/api/vote';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ToggleVoteRequest } from '@/types/vote';

export const useVoteResults = (appointmentId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.voteResults(appointmentId),
    queryFn: () => getVoteResults(appointmentId),
  });

export const useToggleVote = (appointmentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ToggleVoteRequest) => toggleVote(appointmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.voteResults(appointmentId),
      });
    },
  });
};
