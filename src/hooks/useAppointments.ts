import { useQuery } from '@tanstack/react-query';

import { getAppointments } from '@/api/appointment';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useAppointments = () =>
  useQuery({
    queryKey: QUERY_KEYS.appointments(),
    queryFn: getAppointments,
  });
