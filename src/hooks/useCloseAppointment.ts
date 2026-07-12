import { useMutation, useQueryClient } from '@tanstack/react-query';

import { closeAppointment } from '@/api/appointment';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useCloseAppointment = (appointmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeAppointment(appointmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointment(appointmentId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.locations(appointmentId) });
    },
  });
};
