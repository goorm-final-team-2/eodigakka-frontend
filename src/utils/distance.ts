import type { ArrivalStatus } from '@/types/location';

const EARTH_RADIUS_M = 6_371_000;
const ARRIVAL_THRESHOLD_M = 100;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computeArrivalStatus(
  memberLat: number,
  memberLng: number,
  destinationLat: number,
  destinationLng: number,
): Exclude<ArrivalStatus, '미공유'> {
  return haversineDistance(memberLat, memberLng, destinationLat, destinationLng) <=
    ARRIVAL_THRESHOLD_M
    ? '도착 근처'
    : '이동 중';
}
