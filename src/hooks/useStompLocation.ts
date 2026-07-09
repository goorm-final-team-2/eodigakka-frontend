import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ParticipantLocation } from '@/types/location';

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/*
 * WebSocket/STOMP 연결을 관리하는 훅
 *
 * - onConnect 시 /topic/appointments/{id}/locations 구독
 * - 수신 메시지를 TanStack Query 캐시에 즉시 병합 (실시간 업데이트)
 * - 로그인 사용자: Authorization header / 게스트: guestSession cookie (자동 전송)
 * - 연결 실패/끊김 시 5초 후 자동 재연결 (reconnectDelay)
 * - publish 함수: STOMP 연결 중이면 true 반환, 아니면 false (caller가 HTTP fallback)
 */
export function useStompLocation(appointmentId: number, enabled = true) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const publishRef = useRef<((payload: LocationPayload) => boolean) | null>(null);

  useEffect(() => {
    if (!enabled) {
      // cleanup이 이미 setIsConnected(false) 처리 — 여기서 중복 호출 불필요
      publishRef.current = null;
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl =
      (import.meta.env.VITE_WS_URL as string | undefined) ??
      `${protocol}://${window.location.host}/ws`;

    const accessToken = localStorage.getItem('accessToken');

    const client = new Client({
      brokerURL: wsUrl,
      // 로그인 사용자 인증 — 게스트는 guestSession cookie가 WS handshake에 자동 포함됨
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      reconnectDelay: 5_000,

      onConnect: () => {
        setIsConnected(true);

        client.subscribe(`/topic/appointments/${appointmentId}/locations`, (message) => {
          try {
            const incoming = JSON.parse(message.body) as ParticipantLocation;

            // 위치 캐시를 직접 패치 — 다음 폴링 주기 없이 즉시 UI 반영
            queryClient.setQueryData(
              QUERY_KEYS.locations(appointmentId),
              (prev: ParticipantLocation[] | undefined) => {
                if (!prev) return [incoming];
                const idx = prev.findIndex((l) => l.memberId === incoming.memberId);
                if (idx === -1) return [...prev, incoming];
                return prev.map((l, i) => (i === idx ? incoming : l));
              },
            );
          } catch {
            // 메시지 파싱 실패 무시
          }
        });
      },

      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
      onWebSocketError: () => setIsConnected(false),
    });

    // publish 함수를 ref에 등록 — useCallback은 빈 deps로 stable reference 유지
    publishRef.current = (payload: LocationPayload) => {
      if (!client.connected) return false;
      client.publish({
        destination: `/app/appointments/${appointmentId}/locations`,
        body: JSON.stringify(payload),
      });
      return true;
    };

    client.activate();

    return () => {
      publishRef.current = null;
      void client.deactivate();
      setIsConnected(false);
    };
  }, [appointmentId, enabled, queryClient]);

  // stable reference — publishRef.current는 항상 최신 구현을 가리킴
  const publish = useCallback((payload: LocationPayload) => {
    return publishRef.current?.(payload) ?? false;
  }, []);

  return { isConnected, publish };
}
