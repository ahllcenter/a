import { useEffect, useRef, useCallback } from 'react';
import { updateLocation } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useLocationTracking() {
  const { isAuthenticated } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const sendLocation = useCallback(async (lat: number, lng: number) => {
    const now = Date.now();
    if (now - lastSentRef.current < UPDATE_INTERVAL) return;
    lastSentRef.current = now;
    try {
      await updateLocation({ lat, lng });
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        sendLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.warn('Location tracking error:', err.message),
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 30000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isAuthenticated, sendLocation]);
}
