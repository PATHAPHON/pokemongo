import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import {
  Coordinates,
  LocationPreset,
  DEFAULT_PRESET,
} from '@/features/map/services/spawn-engine';

export interface UserLocationState {
  location: Coordinates;
  selectedPreset: LocationPreset | null;
  locationName: string;
  isRealGps: boolean;
  isLoading: boolean;
  errorMsg: string | null;
  selectPreset: (preset: LocationPreset) => void;
  switchToRealGps: () => Promise<boolean>;
}

// Global cached state so selected location is preserved across tab switches and route pops
let cachedLocation: Coordinates = DEFAULT_PRESET.coords;
let cachedPreset: LocationPreset | null = DEFAULT_PRESET;
let cachedLocationName: string = DEFAULT_PRESET.name;
let cachedIsRealGps: boolean = false;

export function useUserLocation(): UserLocationState {
  const [location, setLocation] = useState<Coordinates>(cachedLocation);
  const [selectedPreset, setSelectedPreset] = useState<LocationPreset | null>(
    cachedPreset
  );
  const [locationName, setLocationName] = useState<string>(cachedLocationName);
  const [isRealGps, setIsRealGps] = useState<boolean>(cachedIsRealGps);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * Switch active coordinates to a predefined preset location
   */
  const selectPreset = useCallback((preset: LocationPreset) => {
    cachedLocation = preset.coords;
    cachedPreset = preset;
    cachedLocationName = preset.name;
    cachedIsRealGps = false;

    setLocation(preset.coords);
    setSelectedPreset(preset);
    setLocationName(preset.name);
    setIsRealGps(false);
    setErrorMsg(null);
  }, []);

  /**
   * Request device GPS coordinates on demand using Balanced accuracy (Week 10)
   * Cross-platform: uses navigator.geolocation on Web, expo-location on iOS/Android
   */
  const switchToRealGps = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setErrorMsg(null);

    // 1. Web Browser Geolocation
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: Coordinates = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              };
              cachedLocation = coords;
              cachedPreset = null;
              cachedLocationName = 'Real GPS';
              cachedIsRealGps = true;

              setLocation(coords);
              setSelectedPreset(null);
              setLocationName('Real GPS');
              setIsRealGps(true);
              setIsLoading(false);
              resolve(true);
            },
            (err) => {
              setIsLoading(false);
              setErrorMsg(
                err.code === 1
                  ? 'Location permission denied by browser.'
                  : 'Unable to acquire browser GPS position.'
              );
              resolve(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        });
      } else {
        setIsLoading(false);
        setErrorMsg('Geolocation is not supported by this browser.');
        return false;
      }
    }

    // 2. Mobile (iOS / Android) Foreground Location
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';

      if (!granted) {
        setIsLoading(false);
        setErrorMsg('Location permission was denied.');
        return false;
      }

      // Read position with Balanced accuracy (Week 10 standard)
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (currentPos?.coords) {
        const coords: Coordinates = {
          latitude: currentPos.coords.latitude,
          longitude: currentPos.coords.longitude,
        };
        cachedLocation = coords;
        cachedPreset = null;
        cachedLocationName = 'Real GPS';
        cachedIsRealGps = true;

        setLocation(coords);
        setSelectedPreset(null);
        setLocationName('Real GPS');
        setIsRealGps(true);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to fetch GPS location'
      );
      return false;
    }
  }, []);

  return {
    location,
    selectedPreset,
    locationName,
    isRealGps,
    isLoading,
    errorMsg,
    selectPreset,
    switchToRealGps,
  };
}
