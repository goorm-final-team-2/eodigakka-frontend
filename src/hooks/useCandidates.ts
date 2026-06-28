import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addCandidate, getCandidates } from '@/api/place';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { PlaceCandidateRequest } from '@/types/place';

export const useAddCandidate = (appointmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PlaceCandidateRequest) => addCandidate(appointmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.candidates(appointmentId),
      });
    },
  });
};

// [2-3]에서 구현
export const useCandidates = (appointmentId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.candidates(appointmentId),
    queryFn: () => getCandidates(appointmentId),
    enabled: false, // [2-3]에서 활성화
  });
