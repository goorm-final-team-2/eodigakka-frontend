import { useEffect, useRef } from 'react';

import { useLocationStore } from '@/stores/locationStore';
import { useMapStore } from '@/stores/mapStore';
import type { ConfirmedPlace, ParticipantLocationWithStatus } from '@/types/location';
import { haversineDistance } from '@/utils/distance';

/*
 * 위치 공유 탭에서 지도 위에 핀을 그리는 훅
 *
 * - 확정 장소: 빨간 핀 + 이름 오버레이
 * - 참여자:   memberId 기반 컬러 핀 (본인 제외)
 * - 내 위치:  이동 중 주황, 도착 근처 초록 (더 큰 핀)
 *
 * 컴포넌트 언마운트 시 모든 마커를 정리(cleanup)한다.
 */

// SVG 마커 및 Kakao Map API 에 전달하는 색상은 hex 필수 (CSS 변수 사용 불가)
/* eslint-disable no-restricted-syntax */
const PALETTE = ['#3a86ff', '#a121ce', '#ff6b35', '#00b894', '#fd79a8', '#e17055', '#74b9ff'];
const COLOR_ARRIVED = '#00C73C';
const COLOR_MOVING = '#FF8A00';
const COLOR_CONFIRMED = '#e53935';
const COLOR_MY_LABEL_BG = '#191919';
/* eslint-enable no-restricted-syntax */

function markerSvg(color: string, size = 28): string {
  const h = Math.round(size * (40 / 28));
  const cx = size / 2;
  const r = Math.round(size * (6 / 28));
  const d = `M${cx} 0C${size * 0.225} 0 0 ${h * 0.225} 0 ${cx}c0 ${h * 0.375} ${cx} ${h * 0.65} ${cx} ${h * 0.65}S${size} ${cx + h * 0.375} ${size} ${cx}C${size} ${size * 0.225} ${size * 0.775} 0 ${cx} 0z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 ${size} ${h}"><path d="${d}" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="${cx}" cy="${cx}" r="${r}" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function useLocationMarkers(
  participants: ParticipantLocationWithStatus[],
  confirmedPlace: ConfirmedPlace | null | undefined,
  myMemberId?: number,
) {
  const mapInstance = useMapStore((s) => s.mapInstance);
  const myPosition = useLocationStore((s) => s.myPosition);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myOverlayRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participantMarkersRef = useRef<Map<number, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confirmedMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confirmedOverlayRef = useRef<any>(null);

  // 확정 장소 마커
  useEffect(() => {
    if (!mapInstance || !window.kakao?.maps) return;
    confirmedMarkerRef.current?.setMap(null);
    confirmedOverlayRef.current?.setMap(null);

    if (!confirmedPlace) return;

    const pos = new window.kakao.maps.LatLng(confirmedPlace.latitude, confirmedPlace.longitude);
    const image = new window.kakao.maps.MarkerImage(
      markerSvg(COLOR_CONFIRMED),
      new window.kakao.maps.Size(28, 40),
    );
    confirmedMarkerRef.current = new window.kakao.maps.Marker({
      position: pos,
      image,
      map: mapInstance,
    });

    if (confirmedPlace.name) {
      confirmedOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: `<div style="background:${COLOR_CONFIRMED};color:white;padding:3px 8px;border-radius:9999px;font-size:11px;font-weight:700;white-space:nowrap;margin-bottom:4px;">${confirmedPlace.name}</div>`,
        yAnchor: 2.8,
        map: mapInstance,
      });
    }

    mapInstance.setCenter(pos);
  }, [confirmedPlace, mapInstance]);

  // 참여자 마커 (내 memberId 제외)
  useEffect(() => {
    if (!mapInstance || !window.kakao?.maps) return;

    // 사라진 참여자 제거
    participantMarkersRef.current.forEach((marker, id) => {
      const found = participants.find((p) => p.memberId === id && p.latitude && p.longitude);
      if (!found) {
        marker.setMap(null);
        participantMarkersRef.current.delete(id);
      }
    });

    participants.forEach((p) => {
      if (myMemberId !== undefined && p.memberId === myMemberId) return;
      if (!p.latitude || !p.longitude) return;

      const color = PALETTE[p.memberId % PALETTE.length];
      const pos = new window.kakao.maps.LatLng(p.latitude, p.longitude);
      const image = new window.kakao.maps.MarkerImage(
        markerSvg(color),
        new window.kakao.maps.Size(28, 40),
      );

      const existing = participantMarkersRef.current.get(p.memberId);
      if (existing) {
        existing.setPosition(pos);
        existing.setImage(image);
      } else {
        const marker = new window.kakao.maps.Marker({ position: pos, image, map: mapInstance });
        participantMarkersRef.current.set(p.memberId, marker);
      }
    });
  }, [participants, myMemberId, mapInstance]);

  // 내 위치 마커 (GPS 실시간)
  useEffect(() => {
    if (!mapInstance || !window.kakao?.maps) return;

    if (!myPosition) {
      myMarkerRef.current?.setMap(null);
      myOverlayRef.current?.setMap(null);
      myMarkerRef.current = null;
      myOverlayRef.current = null;
      return;
    }

    const pos = new window.kakao.maps.LatLng(myPosition.lat, myPosition.lng);
    const dist =
      confirmedPlace !== null && confirmedPlace !== undefined
        ? haversineDistance(
            myPosition.lat,
            myPosition.lng,
            confirmedPlace.latitude,
            confirmedPlace.longitude,
          )
        : null;
    const color = dist !== null && dist <= 100 ? COLOR_ARRIVED : COLOR_MOVING;
    const image = new window.kakao.maps.MarkerImage(
      markerSvg(color, 32),
      new window.kakao.maps.Size(32, 46),
    );

    if (myMarkerRef.current) {
      myMarkerRef.current.setPosition(pos);
      myMarkerRef.current.setImage(image);
      myOverlayRef.current?.setPosition(pos);
    } else {
      myMarkerRef.current = new window.kakao.maps.Marker({
        position: pos,
        image,
        map: mapInstance,
      });
      myOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: `<div style="background:${COLOR_MY_LABEL_BG};color:white;padding:2px 7px;border-radius:9999px;font-size:10px;font-weight:700;white-space:nowrap;margin-bottom:4px;">나</div>`,
        yAnchor: 3.4,
        map: mapInstance,
      });
    }
  }, [myPosition, confirmedPlace, mapInstance]);

  // 언마운트 시 전체 마커 정리
  useEffect(() => {
    const participantsMap = participantMarkersRef;
    return () => {
      myMarkerRef.current?.setMap(null);
      myOverlayRef.current?.setMap(null);
      participantsMap.current.forEach((m) => m.setMap(null));
      confirmedMarkerRef.current?.setMap(null);
      confirmedOverlayRef.current?.setMap(null);
    };
  }, []);
}
