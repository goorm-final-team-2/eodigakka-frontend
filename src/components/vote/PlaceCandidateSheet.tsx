import { useEffect, useRef, useState } from 'react';

import type { SnapPoint } from '@/components/common/BottomSheet';
import CandidateList from '@/components/vote/CandidateList';
import { useAddCandidate, useCandidates } from '@/hooks/useCandidates';
import { useMapStore } from '@/stores/mapStore';
import type { KakaoPlace } from '@/types/place';

type SheetMode = 'idle' | 'results' | 'detail';

type PlaceCandidateSheetProps = {
  appointmentId: number;
  snap: SnapPoint;
  onSnapChange: (snap: SnapPoint) => void;
};

const PlaceCandidateSheet = ({ appointmentId, snap, onSnapChange }: PlaceCandidateSheetProps) => {
  const [mode, setMode] = useState<SheetMode>('idle');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { mutate: addCandidate, isPending: isAdding } = useAddCandidate(appointmentId);
  const { data: candidates, isLoading: isCandidatesLoading } = useCandidates(appointmentId);
  const panTo = useMapStore((s) => s.panTo);
  const mapInstance = useMapStore((s) => s.mapInstance);

  const miniMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const miniMapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidateMarkersRef = useRef<any[]>([]);

  // 후보 목록 로드 시 배경 지도에 마커 일괄 추가 + 모든 핀이 보이도록 bounds 조정
  useEffect(() => {
    if (!candidates || !mapInstance || !window.kakao?.maps) return;

    // 기존 마커 제거 후 재생성 (refetch 시 중복 방지)
    candidateMarkersRef.current.forEach((m) => m.setMap(null));
    candidateMarkersRef.current = candidates.map((c) => {
      const position = new window.kakao.maps.LatLng(c.latitude, c.longitude);

      return new window.kakao.maps.Marker({ position, map: mapInstance });
    });

    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      mapInstance.setCenter(
        new window.kakao.maps.LatLng(candidates[0].latitude, candidates[0].longitude),
      );
      return;
    }

    // 모든 핀을 포함하는 bounds로 지도 조정 (하단 바텀시트 여백 고려)
    const bounds = new window.kakao.maps.LatLngBounds();
    candidates.forEach((c) => {
      bounds.extend(new window.kakao.maps.LatLng(c.latitude, c.longitude));
    });
    mapInstance.setBounds(bounds, 60, 60, 220, 60);
  }, [candidates, mapInstance]);

  // 상세 뷰 미니맵 초기화
  // 배경 지도와 독립된 별도 Map 인스턴스 사용
  useEffect(() => {
    if (mode !== 'detail' || !selectedPlace || !miniMapRef.current || !window.kakao?.maps) return;

    const lat = Number(selectedPlace.y);
    const lng = Number(selectedPlace.x);
    const center = new window.kakao.maps.LatLng(lat, lng);

    if (miniMapInstanceRef.current) {
      // snap 변경 후 DOM 업데이트 즉시 relayout → 핀을 항상 미니맵 중앙으로
      const raf = requestAnimationFrame(() => {
        const map = miniMapInstanceRef.current;
        if (!map) return;
        map.relayout();
        map.setCenter(center);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      const miniMap = new window.kakao.maps.Map(miniMapRef.current, { center, level: 4 });
      new window.kakao.maps.Marker({ position: center, map: miniMap });
      miniMapInstanceRef.current = miniMap;
    }
  }, [mode, selectedPlace, snap]);

  const handleSearch = () => {
    if (!keyword.trim() || !window.kakao?.maps?.services) return;

    // 상세 뷰에서 재검색 시 미니맵 인스턴스 초기화 (div 언마운트로 인한 stale ref 방지)
    miniMapInstanceRef.current = null;
    setIsSearching(true);
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: KakaoPlace[], status: string) => {
      setIsSearching(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data);
        setMode('results');
        onSnapChange(snap === 'full' ? 'full' : 'partial');
      } else {
        setResults([]);
      }
    });
  };

  const handleSelectPlace = (place: KakaoPlace) => {
    setSelectedPlace(place);
    setMode('detail');
    // 배경 지도는 독립 동작 — panTo 호출하지 않음
  };

  const handleBackToResults = () => {
    setMode('results');
    miniMapInstanceRef.current = null;
  };

  const handleBackToIdle = () => {
    setMode('idle');
    setResults([]);
    setKeyword('');
    setSelectedPlace(null);
    onSnapChange('partial');
  };

  const handleRecommend = () => {
    if (!selectedPlace) return;

    const lat = Number(selectedPlace.y);
    const lng = Number(selectedPlace.x);

    addCandidate(
      {
        kakaoPlaceId: selectedPlace.id,
        name: selectedPlace.place_name,
        address: selectedPlace.address_name,
        roadAddress: selectedPlace.road_address_name || undefined,
        latitude: lat,
        longitude: lng,
        category: selectedPlace.category_name || undefined,
        placeUrl: selectedPlace.place_url || undefined,
        phone: selectedPlace.phone || undefined,
      },
      {
        onSuccess: () => {
          // 배경 지도: 마커 추가 + 중심 이동
          if (mapInstance && window.kakao?.maps) {
            const position = new window.kakao.maps.LatLng(lat, lng);
            new window.kakao.maps.Marker({ position, map: mapInstance });
          }
          panTo(lat, lng);
          handleBackToIdle();
        },
      },
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── 검색바 ── */}
      <div className="flex-none px-4 pt-2 pb-3 border-b border-hairline">
        {mode !== 'idle' && (
          <button
            type="button"
            className="mb-2 text-sm text-ink-muted-48 flex items-center gap-1"
            onClick={mode === 'detail' ? handleBackToResults : handleBackToIdle}
          >
            ← {mode === 'detail' ? '목록으로' : '검색 취소'}
          </button>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="장소를 검색하세요"
            className="flex-1 px-4 py-2 rounded-pill border border-hairline bg-canvas-parchment text-ink text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 rounded-pill bg-primary text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {isSearching ? '검색 중' : '검색'}
          </button>
        </div>
      </div>

      {/* ── 콘텐츠 영역 ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: snap !== 'hidden' ? 'auto' : 'hidden',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        {/* 검색 결과 */}
        {mode === 'results' && (
          <div>
            <p className="px-4 py-3 text-sm text-ink-muted-48">검색 결과 {results.length}개</p>
            {results.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted-48">
                검색 결과가 없습니다
              </p>
            ) : (
              <ul>
                {results.map((place, idx) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      className="w-full flex items-start gap-3 px-4 py-3 border-b border-hairline text-left active:bg-canvas-parchment"
                      onClick={() => handleSelectPlace(place)}
                    >
                      <span className="flex-none w-6 h-6 mt-0.5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {place.place_name}
                        </p>
                        <p className="text-xs text-ink-muted-48 mt-0.5 truncate">
                          {place.road_address_name || place.address_name}
                        </p>
                        <p className="text-xs text-ink-muted-48 mt-0.5 truncate">
                          {place.category_name}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 장소 상세 */}
        {mode === 'detail' && selectedPlace && (
          <div>
            {/* 미니맵: 항상 DOM에 유지 (인스턴스 재연결 문제 방지), peek일 때 h-0으로 숨김 */}
            <div
              ref={miniMapRef}
              className={`w-full bg-canvas-parchment overflow-hidden ${
                snap === 'peek' ? 'h-0' : snap === 'full' ? 'h-56' : 'h-36'
              }`}
              style={{ transition: 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)' }}
            />

            {snap === 'full' ? (
              // 3단계: 세로 레이아웃 + 전체 너비 버튼
              <>
                <div className="px-4 py-4">
                  <p className="text-xs text-ink-muted-48">{selectedPlace.category_name}</p>
                  <h2 className="text-lg font-semibold text-ink mt-1">
                    {selectedPlace.place_name}
                  </h2>
                  <p className="text-sm text-ink-muted-80 mt-1">
                    {selectedPlace.road_address_name || selectedPlace.address_name}
                  </p>
                  {selectedPlace.phone && (
                    <p className="text-sm text-ink-muted-48 mt-1 flex items-center gap-1">
                      <span>📞</span>
                      {selectedPlace.phone}
                    </p>
                  )}
                </div>
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <button
                    type="button"
                    className="w-full py-3 rounded-pill bg-primary text-sm font-semibold text-on-primary disabled:opacity-50"
                    onClick={handleRecommend}
                    disabled={isAdding}
                  >
                    {isAdding ? '추천 중...' : '이 장소 추천하기'}
                  </button>
                  <a
                    href={selectedPlace.place_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-pill border border-hairline text-sm text-ink text-center"
                  >
                    카카오맵에서 자세히 보기 →
                  </a>
                </div>
              </>
            ) : (
              // 1단계(peek) / 2단계(partial): 가로 레이아웃 — 정보 왼쪽, 버튼 오른쪽
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink-muted-48 truncate">
                    {selectedPlace.category_name}
                  </p>
                  <h2 className="text-base font-semibold text-ink mt-0.5 truncate">
                    {selectedPlace.place_name}
                  </h2>
                  <p className="text-sm text-ink-muted-80 mt-0.5 truncate">
                    {selectedPlace.road_address_name || selectedPlace.address_name}
                  </p>
                  {selectedPlace.phone && (
                    <p className="text-sm text-ink-muted-48 mt-0.5 truncate">
                      {selectedPlace.phone}
                    </p>
                  )}
                </div>
                <div className="flex-none flex flex-col gap-1.5 pt-0.5">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-pill bg-primary text-xs font-semibold text-on-primary whitespace-nowrap disabled:opacity-50"
                    onClick={handleRecommend}
                    disabled={isAdding}
                  >
                    {isAdding ? '추천 중...' : '추천하기'}
                  </button>
                  <a
                    href={selectedPlace.place_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-pill border border-hairline text-xs text-ink text-center whitespace-nowrap"
                  >
                    지도 보기
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 기본 상태 — 추천 장소 목록 */}
        {mode === 'idle' && (
          <div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
              <h2 className="text-sm font-semibold text-ink">추천 장소</h2>
              {candidates && candidates.length > 0 && (
                <span className="text-xs text-ink-muted-48">{candidates.length}곳</span>
              )}
            </div>
            <CandidateList
              candidates={Array.isArray(candidates) ? candidates : []}
              isLoading={isCandidatesLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCandidateSheet;
