import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchRoute } from '@/api/location';
import { useLocationStore } from '@/stores/locationStore';
import { useMapStore } from '@/stores/mapStore';
import type { ConfirmedPlace } from '@/types/location';
import { haversineDistance } from '@/utils/distance';

export interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
}

const REROUTE_THRESHOLD_M = 50; // 50m 이상 이동 시 재탐색
// eslint-disable-next-line no-restricted-syntax
const POLYLINE_COLOR = '#3a86ff'; // Kakao Map Polyline은 hex 필수

function placeKey(place: ConfirmedPlace): string {
  return `${place.latitude.toFixed(6)},${place.longitude.toFixed(6)}`;
}

/*
 * 내 위치 → 확정 장소 경로를 지도에 그리는 훅
 *
 * - Kakao Mobility Directions API 호출 (Vite 프록시 /navi 경유)
 * - 50m 이상 이동 시에만 재탐색 (빈번한 API 호출 방지)
 * - confirmedPlace 변경 시 폴리라인 자동 초기화
 * - setState-in-effect 방지: routeState에 키를 함께 저장해 stale 결과 자동 무시
 */
export function useRouteDisplay(confirmedPlace: ConfirmedPlace | null | undefined) {
  const mapInstance = useMapStore((s) => s.mapInstance);
  const myPosition = useLocationStore((s) => s.myPosition);

  // routeState에 placeKey를 함께 저장 → confirmedPlace 변경 시 stale 결과 자동 무시
  const [routeState, setRouteState] = useState<{ key: string; info: RouteInfo } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  const currentKey = confirmedPlace ? placeKey(confirmedPlace) : null;
  // 현재 confirmedPlace의 키와 일치하는 경우에만 유효한 routeInfo
  const routeInfo = routeState?.key === currentKey && currentKey !== null ? routeState.info : null;

  const drawRoute = useCallback(
    async (pos: { lat: number; lng: number }, keyForThisRequest: string) => {
      if (!confirmedPlace || !mapInstance || !window.kakao?.maps) return;

      setIsLoading(true);
      try {
        const result = await fetchRoute(
          { x: pos.lng, y: pos.lat },
          { x: confirmedPlace.longitude, y: confirmedPlace.latitude },
        );
        if (!result) return;

        // 요청 시점의 key가 현재 confirmedPlace와 일치할 때만 반영
        setRouteState({
          key: keyForThisRequest,
          info: { distance: result.distance, duration: result.duration },
        });

        // 폴리라인 좌표 구성
        const path: unknown[] = [];
        for (let i = 0; i < result.path.length; i += 2) {
          path.push(new window.kakao.maps.LatLng(result.path[i + 1], result.path[i]));
        }

        polylineRef.current?.setMap(null);
        polylineRef.current = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 5,
          strokeColor: POLYLINE_COLOR,
          strokeOpacity: 0.85,
          strokeStyle: 'solid',
        });
        polylineRef.current.setMap(mapInstance);

        // 경로 전체가 보이도록 지도 범위 조정
        const bounds = new window.kakao.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        mapInstance.setBounds(bounds, 60, 60, 220, 60);
      } catch {
        // 경로 조회 실패 — 조용히 무시
      } finally {
        setIsLoading(false);
      }
    },
    [confirmedPlace, mapInstance],
  );

  // 내 위치 변경 시 50m 이상 이동했을 때만 재탐색
  useEffect(() => {
    if (!myPosition || !confirmedPlace || !currentKey) return;

    const last = lastPositionRef.current;
    if (last) {
      const moved = haversineDistance(myPosition.lat, myPosition.lng, last.lat, last.lng);
      if (moved < REROUTE_THRESHOLD_M) return;
    }

    lastPositionRef.current = myPosition;
    void drawRoute(myPosition, currentKey);
  }, [myPosition, confirmedPlace, currentKey, drawRoute]);

  // 확정 장소 변경 시 폴리라인 + 재탐색 상태 초기화 (setState 없음)
  useEffect(() => {
    polylineRef.current?.setMap(null);
    polylineRef.current = null;
    lastPositionRef.current = null;
  }, [confirmedPlace]);

  // 언마운트 시 폴리라인 제거
  useEffect(() => {
    return () => {
      polylineRef.current?.setMap(null);
    };
  }, []);

  return { routeInfo, isRouteLoading: isLoading };
}
