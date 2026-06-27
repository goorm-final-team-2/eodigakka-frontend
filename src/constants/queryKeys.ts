export const QUERY_KEYS = {
  appointment: (id: number) => ['appointment', id] as const,
  candidates: (appointmentId: number) => ['candidates', appointmentId] as const,
  voteResults: (appointmentId: number) => ['voteResults', appointmentId] as const,
  confirmedPlace: (appointmentId: number) => ['confirmedPlace', appointmentId] as const,
  members: (appointmentId: number) => ['members', appointmentId] as const,
  locations: (appointmentId: number) => ['locations', appointmentId] as const,
} as const;
