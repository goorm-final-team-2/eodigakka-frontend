import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteAppointment, getAppointments } from '@/api/appointment';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useAppointments = () =>
  useQuery({
    queryKey: QUERY_KEYS.appointments(),
    queryFn: getAppointments,
  });

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() });
    },
  });
};
