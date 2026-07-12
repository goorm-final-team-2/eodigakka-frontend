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

export interface AppointmentMember {
  memberId: number;
  memberType: 'USER' | 'GUEST';
  role: 'HOST' | 'MEMBER';
  displayName: string;
  profileImage: string | null;
  joinedAt: string;
}

// 약속방 생성 요청
export interface AppointmentCreateRequest {
  title: string;
  appointmentDate: string; // 'YYYY-MM-DD'
  appointmentTime: string; // 'HH:mm:ss'
  description?: string;
  preferredArea?: string;
  notice?: string;
}

// 약속방 참여 요청 (로그인 유저)
export interface AppointmentJoinRequest {
  inviteCode: string;
}

export interface AppointmentInviteResponse {
  appointmentId: number;
  title: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string | null;
  preferredArea: string | null;
  notice: string | null;
  inviteCode: string;
  status: AppointmentStatus;
}

// 약속방 참여 요청 (게스트)
export interface GuestJoinRequest {
  inviteCode: string;
  guestName: string;
}

// 게스트 참여 응답
export interface GuestJoinResponse {
  appointment: Appointment;
  guest: {
    memberId: number;
    guestName: string;
  };
}
