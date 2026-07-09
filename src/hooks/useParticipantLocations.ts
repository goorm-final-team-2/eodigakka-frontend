import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getMembers } from '@/api/appointment';
import { getLocations } from '@/api/location';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ConfirmedPlace, ParticipantLocationWithStatus } from '@/types/location';
import { computeArrivalStatus } from '@/utils/distance';

const POLL_INTERVAL_MS = 5_000;

export function useParticipantLocations(
  appointmentId: number,
  confirmedPlace?: ConfirmedPlace,
  isConfirmed = false,
) {
  // 참여자 기본 정보 (닉네임, 역할 등) — 자주 바뀌지 않으므로 일반 캐싱
  const membersQuery = useQuery({
    queryKey: QUERY_KEYS.members(appointmentId),
    queryFn: () => getMembers(appointmentId),
  });

  // 참여자 위치 — CONFIRMED 상태일 때만 5초마다 폴링 (PLANNING 상태에서 400 방지)
  const locationsQuery = useQuery({
    queryKey: QUERY_KEYS.locations(appointmentId),
    queryFn: () => getLocations(appointmentId),
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: 0,
    enabled: isConfirmed,
  });

  // 멤버 목록 기준으로 위치 정보를 조인해서 도착 상태 계산
  const participants = useMemo((): ParticipantLocationWithStatus[] => {
    if (!membersQuery.data) return [];

    const locationMap = new Map((locationsQuery.data ?? []).map((loc) => [loc.memberId, loc]));

    return membersQuery.data.map((member) => {
      const location = locationMap.get(member.memberId);

      if (!location) {
        // 위치 목록에 없으면 공유 안 함
        return {
          memberId: member.memberId,
          memberType: member.memberType,
          nickname: member.displayName,
          profileImage: member.profileImage,
          role: member.role,
          latitude: null,
          longitude: null,
          updatedAt: null,
          arrivalStatus: '미공유',
        };
      }

      return {
        memberId: member.memberId,
        memberType: member.memberType,
        nickname: member.displayName,
        profileImage: member.profileImage,
        role: member.role,
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: location.updatedAt,
        arrivalStatus:
          confirmedPlace !== undefined
            ? computeArrivalStatus(
                location.latitude,
                location.longitude,
                confirmedPlace.latitude,
                confirmedPlace.longitude,
              )
            : '이동 중',
      };
    });
  }, [membersQuery.data, locationsQuery.data, confirmedPlace]);

  return {
    participants,
    isLoading: membersQuery.isLoading || locationsQuery.isLoading,
    isError: membersQuery.isError || locationsQuery.isError,
  };
}
