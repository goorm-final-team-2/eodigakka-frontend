export const ROUTES = {
  HOME: '/',
  ROOM: '/rooms/:appointmentId',
  APPOINTMENT_DETAIL: '/appointments/:id',
  LOCATION_SHARE: '/appointments/:id/location',
  LOGIN: '/login',
  KAKAO_CALLBACK: '/oauth/kakao/callback',
} as const;
