export const QUERY_KEYS = {
  appointments: () => ['appointments'] as const,
  appointment: (id: number) => ['appointment', id] as const,
  members: (appointmentId: number) => ['members', appointmentId] as const,
  candidates: (appointmentId: number) => ['candidates', appointmentId] as const,
  votes: (appointmentId: number) => ['votes', appointmentId] as const,
  locations: (appointmentId: number) => ['locations', appointmentId] as const,
} as const;
