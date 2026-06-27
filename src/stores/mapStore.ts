import { create } from 'zustand';

type MapStore = {
  center: { lat: number; lng: number };
  selectedPlaceId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapInstance: any | null;
  setCenter: (lat: number, lng: number) => void;
  setSelectedPlaceId: (id: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMapInstance: (map: any) => void;
  panTo: (lat: number, lng: number) => void;
};

export const useMapStore = create<MapStore>((set, get) => ({
  center: { lat: 37.5665, lng: 126.978 }, // 서울 기본값
  selectedPlaceId: null,
  mapInstance: null,

  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  setMapInstance: (map) => set({ mapInstance: map }),

  panTo: (lat, lng) => {
    const map = get().mapInstance;
    if (map && window.kakao?.maps) {
      map.panTo(new window.kakao.maps.LatLng(lat, lng));
    }
    set({ center: { lat, lng } });
  },
}));
