import { useEffect, useRef } from 'react';

import { useMapStore } from '@/stores/mapStore';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

// 모듈 레벨 플래그 — StrictMode 이중 실행 시 스크립트 중복 삽입 방지
let mapScriptLoading = false;

const KakaoMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { center, setMapInstance } = useMapStore();

  useEffect(() => {
    const jsKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;

    const initMap = () => {
      if (!containerRef.current) return;
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 5,
      });
      setMapInstance(map);
    };

    // 이미 SDK 로드 완료
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    // 다른 컴포넌트가 이미 로딩 중 → 완료될 때까지 폴링
    if (mapScriptLoading) {
      const interval = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // 최초 로드
    mapScriptLoading = true;
    const script = document.createElement('script');
    // autoload=false: React 마운트 이후 수동으로 kakao.maps.load() 호출
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(initMap);
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="w-full h-full" />;
};

export default KakaoMap;
