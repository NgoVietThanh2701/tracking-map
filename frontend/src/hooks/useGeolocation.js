import { useState, useEffect, useCallback } from 'react';

const DEFAULT_CENTER = [21.0285, 105.8542]; // Hà Nội mặc định

export function useGeolocation(options = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'

  const updatePosition = useCallback((pos) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    });
    setError(null);
  }, []);

  const updateError = useCallback((err) => {
    setError(err);
    if (err.code === 1) {
      setPermission('denied');
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({ code: 2, message: 'Trình duyệt không hỗ trợ định vị' });
      return;
    }

    const checkPermission = () => {
      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          setPermission(result.state);
          if (result.state === 'denied') {
            setError({ code: 1, message: 'Bạn đã từ chối quyền truy cập vị trí' });
          }
        }).catch(() => setPermission('prompt'));
      } else {
        setPermission('prompt');
      }
    };

    checkPermission();

    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      updateError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updatePosition, updateError, options.enableHighAccuracy]);

  const requestLocation = useCallback(() => {
    setPermission('prompt');
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        updatePosition,
        updateError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [updatePosition, updateError]);

  return {
    position,
    error,
    permission,
    center: position ? [position.lat, position.lng] : DEFAULT_CENTER,
    requestLocation,
  };
}
