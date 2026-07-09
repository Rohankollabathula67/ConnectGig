/**
 * ConnectGig — Location Hook (§2.2)
 * Manages runtime GPS permissions, fetching coords, and mock fallback.
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

const DEFAULT_MOCK_LOCATION: LocationCoords = {
  latitude: 37.78825,
  longitude: -122.4324,
};

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const requestLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied. Using mock location.');
        setLocation(DEFAULT_MOCK_LOCATION);
        setLoading(false);
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error fetching location. Using mock location.');
      setLocation(DEFAULT_MOCK_LOCATION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    location,
    errorMsg,
    loading,
    refetch: requestLocation,
  };
}
