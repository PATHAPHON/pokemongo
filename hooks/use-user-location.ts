import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates, DEFAULT_COORDINATES } from '@/services/spawn-engine';

export interface UserLocationState {
  location: Coordinates;
  heading: number | null;
  speed: number | null;
  isLoading: boolean;
  permissionGranted: boolean;
  errorMsg: string | null;
}

export function useUserLocation(): UserLocationState {
  const [location, setLocation] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [heading, setHeading] = useState<number | null>(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Web-specific location & orientation tracking
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (isMounted) {
              setLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
              setSpeed(pos.coords.speed);
            }
          },
          () => {
            // Keep default Bangkok coordinates smoothly
          },
          { timeout: 4000 }
        );
      }

      // Compass orientation listener on web
      const handleOrientation = (e: any) => {
        if (!isMounted) return;
        if (typeof e.webkitCompassHeading === 'number') {
          setHeading(Math.round(e.webkitCompassHeading));
        } else if (typeof e.alpha === 'number') {
          setHeading(Math.round((360 - e.alpha) % 360));
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }

      return () => {
        isMounted = false;
        if (typeof window !== 'undefined') {
          window.removeEventListener('deviceorientation', handleOrientation, true);
        }
      };
    }

    async function initNativeSensors() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) {
            setPermissionGranted(false);
            setErrorMsg('Location permission was denied. Using fallback area.');
          }
          return;
        }

        if (isMounted) {
          setPermissionGranted(true);
        }

        // 1. Initial quick position
        try {
          const initialPos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (isMounted) {
            setLocation({
              latitude: initialPos.coords.latitude,
              longitude: initialPos.coords.longitude,
            });
            setSpeed(initialPos.coords.speed);
          }
        } catch {
          // Keep default coordinates
        }

        // 2. High-frequency Compass Heading Tracking (Magnetometer)
        try {
          headingSubRef.current = await Location.watchHeadingAsync((headingData) => {
            if (!isMounted) return;
            const deg =
              headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
            if (deg >= 0) {
              setHeading(Math.round(deg));
            }
          });
        } catch {
          // Ignore compass if sensor unavailable on some simulators
        }

        // 3. High-Frequency Real-Time Navigation GPS
        locationSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 400,
            distanceInterval: 0.5,
          },
          (newPos) => {
            if (!isMounted) return;
            setLocation({
              latitude: newPos.coords.latitude,
              longitude: newPos.coords.longitude,
            });
            setSpeed(newPos.coords.speed);
          }
        );
      } catch (error) {
        if (isMounted) {
          setErrorMsg(error instanceof Error ? error.message : 'Failed to fetch sensors');
        }
      }
    }

    initNativeSensors();

    return () => {
      isMounted = false;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
      if (headingSubRef.current) {
        headingSubRef.current.remove();
        headingSubRef.current = null;
      }
    };
  }, []);

  return {
    location,
    heading,
    speed,
    isLoading,
    permissionGranted,
    errorMsg,
  };
}
