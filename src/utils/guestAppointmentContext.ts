const GUEST_APPOINTMENT_ID_KEY = 'guestAppointmentId';
const GUEST_INVITE_CODE_KEY = 'guestInviteCode';

export type GuestAppointmentContext = {
  appointmentId: number;
  inviteCode: string;
};

export const saveGuestAppointmentContext = (appointmentId: number, inviteCode: string) => {
  localStorage.setItem(GUEST_APPOINTMENT_ID_KEY, String(appointmentId));
  localStorage.setItem(GUEST_INVITE_CODE_KEY, inviteCode);
};

export const getGuestAppointmentContext = (): GuestAppointmentContext | null => {
  const appointmentId = Number(localStorage.getItem(GUEST_APPOINTMENT_ID_KEY));
  const inviteCode = localStorage.getItem(GUEST_INVITE_CODE_KEY);

  if (!Number.isFinite(appointmentId) || appointmentId <= 0 || !inviteCode) {
    return null;
  }

  return { appointmentId, inviteCode };
};

export const clearGuestAppointmentContext = () => {
  localStorage.removeItem(GUEST_APPOINTMENT_ID_KEY);
  localStorage.removeItem(GUEST_INVITE_CODE_KEY);
};
