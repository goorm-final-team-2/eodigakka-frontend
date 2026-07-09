import { useCallback, useEffect, useRef, useState } from 'react';

import type { LocationPayload } from './useStompLocation';

import { sendLocation } from '@/api/location';
import { useLocationStore } from '@/stores/locationStore';

const HTTP_SEND_INTERVAL_MS = 10_000;

/*
 * 내 위치 공유 ON/OFF를 관리하는 훅
 *
 * 전송 전략:
 *   1. stompPublish(payload) 시도 → STOMP 연결 중이면 true 반환하고 종료
 *   2. STOMP 미연결(false 반환) → HTTP PUT /locations/me fallback (10초 throttle)
 *
 * stompPublish는 useStompLocation이 반환하는 stable function reference.
 */
export function useLocationShare(
  appointmentId: number,
  stompPublish: (payload: LocationPayload) => boolean,
) {
  const {
    isSharing,
    permissionStatus,
    sharingError,
    setSharing,
    setMyPosition,
    setPermissionStatus,
    setSharingError,
  } = useLocationStore();

  const [isStarting, setIsStarting] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastHttpSentRef = useRef<number>(0);

  const throttleSend = useCallback(
    (latitude: number, longitude: number, accuracy: number) => {
      // STOMP 우선 시도
      const sentViaStomp = stompPublish({ latitude, longitude, accuracy });
      if (sentViaStomp) return;

      // STOMP 미연결 → HTTP fallback (10초 throttle)
      const now = Date.now();
      if (now - lastHttpSentRef.current >= HTTP_SEND_INTERVAL_MS) {
        lastHttpSentRef.current = now;
        sendLocation(appointmentId, { latitude, longitude, accuracy }).catch(() => {});
      }
    },
    [appointmentId, stompPublish],
  );

  const startSharing = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermissionStatus('unavailable');
      setSharingError('이 기기는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setSharingError(null);
    setIsStarting(true);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 0,
        }),
      );

      setPermissionStatus('granted');

      const { latitude, longitude, accuracy } = pos.coords;
      setMyPosition({ lat: latitude, lng: longitude });

      // 즉시 한 번 전송 (STOMP → HTTP 순)
      const sentViaStomp = stompPublish({ latitude, longitude, accuracy });
      if (!sentViaStomp) {
        sendLocation(appointmentId, { latitude, longitude, accuracy }).catch(() => {});
        lastHttpSentRef.current = Date.now();
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (p) => {
          const { latitude: lat, longitude: lng, accuracy: acc } = p.coords;
          setMyPosition({ lat, lng });
          throttleSend(lat, lng, acc);
        },
        () => {
          // watchPosition 오류는 무시 — 이미 공유 시작 성공
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
      );

      setSharing(true);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setPermissionStatus('denied');
          setSharingError(
            '위치 권한이 거부되었습니다. 설정 > 개인정보 보호 > 위치 서비스에서 허용해주세요.',
          );
        } else {
          setSharingError('위치를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } finally {
      setIsStarting(false);
    }
  }, [
    appointmentId,
    stompPublish,
    setPermissionStatus,
    setSharingError,
    setMyPosition,
    setSharing,
    throttleSend,
  ]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    // 서버 DELETE 엔드포인트 없음 — 전송 중단으로 공유 종료 (Redis TTL 만료)
    setSharing(false);
    setMyPosition(null);
  }, [setSharing, setMyPosition]);

  const toggleSharing = useCallback(() => {
    if (isSharing) {
      stopSharing();
    } else {
      void startSharing();
    }
  }, [isSharing, startSharing, stopSharing]);

  // 페이지 언마운트 시 위치 감시 해제
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isSharing,
    permissionStatus,
    sharingError,
    toggleSharing,
    isPending: isStarting,
  };
}
