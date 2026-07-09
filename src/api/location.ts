import apiClient from './index';

import type { ApiListResponse } from '@/types/api';
import type { LocationCoords, ParticipantLocation } from '@/types/location';

// PUT /api/appointments/{id}/locations/me — 내 위치 공유/갱신 (upsert)
export function sendLocation(appointmentId: number, coords: LocationCoords) {
  return apiClient
    .put<void>(`/appointments/${appointmentId}/locations/me`, coords)
    .then((res) => res.data);
}

// GET /api/appointments/{id}/locations — 위치를 공유 중인 참여자 목록
export function getLocations(appointmentId: number) {
  return apiClient
    .get<ApiListResponse<ParticipantLocation>>(`/appointments/${appointmentId}/locations`)
    .then((res) => res.data.data);
}

export interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
  path: number[]; // flat array [lng, lat, lng, lat, ...]
}

// Kakao Mobility Directions API — Vite 프록시(/navi) 경유
export async function fetchRoute(
  origin: { x: number; y: number }, // x=경도, y=위도
  destination: { x: number; y: number },
): Promise<RouteResult | null> {
  const key = import.meta.env.VITE_KAKAO_REST_API_KEY as string;
  const params = new URLSearchParams({
    origin: `${origin.x},${origin.y}`,
    destination: `${destination.x},${destination.y}`,
    priority: 'TIME',
  });

  try {
    const res = await fetch(`/navi/v1/directions?${params.toString()}`, {
      headers: { Authorization: `KakaoAK ${key}` },
    });
    if (!res.ok) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as { routes?: any[] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const route = data.routes?.[0] as any;
    if (!route || route.result_code !== 0) return null;

    const allVertexes: number[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (route.sections as any[]).forEach((section: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (section.roads as any[]).forEach((road: any) =>
        allVertexes.push(...(road.vertexes as number[])),
      );
    });

    return {
      distance: route.summary.distance as number,
      duration: route.summary.duration as number,
      path: allVertexes,
    };
  } catch {
    return null;
  }
}
