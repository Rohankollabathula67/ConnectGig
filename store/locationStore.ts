/**
 * ConnectGig — Location Store (§2.2)
 * Zustand store to manage real-time coordinates, updates, and tracking states.
 */

import { create } from 'zustand';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationState {
  userLocation: LocationCoords | null;
  workerLocation: LocationCoords | null;
  trackingActive: boolean;
  setUserLocation: (coords: LocationCoords) => void;
  setWorkerLocation: (coords: LocationCoords) => void;
  startSimulatedTracking: (startCoords: LocationCoords) => () => void;
  stopTracking: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => {
  let intervalId: any = null;

  return {
    userLocation: null,
    workerLocation: null,
    trackingActive: false,

    setUserLocation: (coords) => set({ userLocation: coords }),
    setWorkerLocation: (coords) => set({ workerLocation: coords }),

    /**
     * Simulation mode: slowly moves the worker's coordinate closer to user's location
     */
    startSimulatedTracking: (startCoords) => {
      set({ workerLocation: startCoords, trackingActive: true });
      
      if (intervalId) clearInterval(intervalId);

      intervalId = setInterval(() => {
        const state = get();
        const user = state.userLocation;
        const worker = state.workerLocation;

        if (user && worker) {
          // Calculate step closer (10% step)
          const latDiff = user.latitude - worker.latitude;
          const lngDiff = user.longitude - worker.longitude;

          // If close enough, stop simulating
          if (Math.abs(latDiff) < 0.0002 && Math.abs(lngDiff) < 0.0002) {
            clearInterval(intervalId);
            set({ trackingActive: false });
            return;
          }

          set({
            workerLocation: {
              latitude: worker.latitude + latDiff * 0.15,
              longitude: worker.longitude + lngDiff * 0.15,
            },
          });
        }
      }, 3500);

      // Return cleanup function
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        set({ trackingActive: false });
      };
    },

    stopTracking: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      set({ trackingActive: false, workerLocation: null });
    },
  };
});
