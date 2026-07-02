export type AppointmentStatus = 'PLANNING' | 'CONFIRMED' | 'CLOSED';
export type AppointmentMemberRole = 'HOST' | 'MEMBER';

export type Appointment = {
  id: number;
  title: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string | null;
  preferredArea: string | null;
  notice: string | null;
  inviteCode: string;
  status: AppointmentStatus;
  role: AppointmentMemberRole;
};
