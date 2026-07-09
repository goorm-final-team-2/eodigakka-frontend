export interface AppointmentMember {
  memberId: number;
  memberType: 'USER' | 'GUEST';
  role: 'HOST' | 'MEMBER';
  displayName: string;
  profileImage: string | null;
  joinedAt: string;
}
