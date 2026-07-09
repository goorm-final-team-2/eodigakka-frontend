import { useQuery } from '@tanstack/react-query';

import { getAppointment } from '@/api/appointment';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useAppointment = (appointmentId: number) =>
  useQuery({
    queryKey: QUERY_KEYS.appointment(appointmentId),
    queryFn: () => getAppointment(appointmentId),
  });
