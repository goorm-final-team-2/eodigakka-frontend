import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addCandidate, deleteCandidate, getCandidates } from '@/api/place';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { PlaceCandidateRequest, PlaceCandidateResponse } from '@/types/place';

export const useAddCandidate = (appointmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PlaceCandidateRequest) => addCandidate(appointmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.candidates(appointmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.voteResults(appointmentId),
      });
    },
  });
};

export const useCandidates = (appointmentId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.candidates(appointmentId),
    queryFn: () => getCandidates(appointmentId),
  });

export const useDeleteCandidate = (appointmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeCandidateId: number) => deleteCandidate(appointmentId, placeCandidateId),
    onMutate: async (placeCandidateId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.candidates(appointmentId) });
      const previous = queryClient.getQueryData<PlaceCandidateResponse[]>(
        QUERY_KEYS.candidates(appointmentId),
      );
      queryClient.setQueryData<PlaceCandidateResponse[]>(
        QUERY_KEYS.candidates(appointmentId),
        (old) => old?.filter((c) => c.id !== placeCandidateId) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.candidates(appointmentId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.candidates(appointmentId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.voteResults(appointmentId) });
    },
  });
};
