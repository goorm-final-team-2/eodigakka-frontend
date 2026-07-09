import { create } from 'zustand';

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationState {
  isSharing: boolean;
  myPosition: Coords | null;
  permissionStatus: PermissionStatus;
  sharingError: string | null;

  setSharing: (sharing: boolean) => void;
  setMyPosition: (pos: Coords | null) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setSharingError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  isSharing: false,
  myPosition: null,
  permissionStatus: 'prompt' as PermissionStatus,
  sharingError: null,
};

export const useLocationStore = create<LocationState>((set) => ({
  ...initialState,
  setSharing: (isSharing) => set({ isSharing }),
  setMyPosition: (myPosition) => set({ myPosition }),
  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
  setSharingError: (sharingError) => set({ sharingError }),
  reset: () => set(initialState),
}));
