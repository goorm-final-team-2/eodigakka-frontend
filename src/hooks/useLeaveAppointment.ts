import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leaveAppointment } from '@/api/appointment';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useLeaveAppointment = (appointmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveAppointment(appointmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() });
      void queryClient.removeQueries({ queryKey: QUERY_KEYS.appointment(appointmentId) });
      void queryClient.removeQueries({ queryKey: QUERY_KEYS.members(appointmentId) });
      void queryClient.removeQueries({ queryKey: QUERY_KEYS.locations(appointmentId) });
    },
  });
};
