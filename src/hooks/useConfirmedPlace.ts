import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { confirmPlace, getConfirmedPlace } from '@/api/confirmed';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ConfirmPlaceRequest } from '@/types/confirmed';

export const useConfirmedPlace = (appointmentId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.confirmedPlace(appointmentId),
    queryFn: () => getConfirmedPlace(appointmentId),
  });

export const useConfirmPlace = (appointmentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ConfirmPlaceRequest) => confirmPlace(appointmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.confirmedPlace(appointmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.appointment(appointmentId),
      });
    },
  });
};
