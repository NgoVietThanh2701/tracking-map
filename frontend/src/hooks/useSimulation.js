import { useCallback, useEffect, useRef, useState } from "react";

export function useSimulation() {
  const [playing, setPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [latlngs, setLatlngs] = useState([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const durationRef = useRef(0);
  const playingRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  const onMovementSaveRef = useRef(null);
  const destinationRef = useRef(null);

  const stopInternal = useCallback(() => {
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    playingRef.current = false;
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    stopInternal();
    setLatlngs([]);
    setCurrentPosition(null);
  }, [stopInternal]);

  const start = useCallback(
    (points, durationSeconds, onMovementSave, destination) => {
      if (!Array.isArray(points) || points.length < 2 || durationSeconds <= 0) {
        return;
      }

      stopInternal();
      setLatlngs(points);
      playingRef.current = true;
      setPlaying(true);
      startTimeRef.current = performance.now();
      durationRef.current = durationSeconds * 1000;
      lastSaveTimeRef.current = 0;
      onMovementSaveRef.current = onMovementSave;
      destinationRef.current = destination;

      // Save initial position
      if (onMovementSaveRef.current && points.length > 0) {
        const [lat, lng] = points[0];
        onMovementSaveRef.current(lat, lng);
      }

      const step = (now) => {
        if (!playingRef.current) {
          return;
        }

        const elapsed = now - startTimeRef.current;
        const progress =
          durationRef.current <= 0
            ? 1
            : Math.min(1, Math.max(0, elapsed / durationRef.current));

        const totalSegments = points.length - 1;
        const position = progress * totalSegments;
        const index = Math.floor(position);

        if (index >= totalSegments) {
          // Save final position with destination coordinates
          if (onMovementSaveRef.current && destinationRef.current) {
            const { lat, lng } = destinationRef.current;
            onMovementSaveRef.current(lat, lng);
          }
          setCurrentPosition(points[points.length - 1]);
          stopInternal();
          return;
        }

        const t = position - index;
        const [lat1, lng1] = points[index];
        const [lat2, lng2] = points[index + 1];
        const lat = lat1 + (lat2 - lat1) * t;
        const lng = lng1 + (lng2 - lng1) * t;
        setCurrentPosition([lat, lng]);

        // Save movement record every 2 seconds
        if (elapsed - lastSaveTimeRef.current >= 2000) {
          lastSaveTimeRef.current = elapsed;
          if (onMovementSaveRef.current) {
            onMovementSaveRef.current(lat, lng);
          }
        }

        if (playingRef.current) {
          animationRef.current = requestAnimationFrame(step);
        }
      };

      animationRef.current = requestAnimationFrame(step);
    },
    [stopInternal],
  );

  const stop = useCallback(() => {
    stopInternal();
  }, [stopInternal]);

  useEffect(
    () => () => {
      stopInternal();
    },
    [stopInternal],
  );

  return {
    playing,
    currentPosition,
    latlngs,
    start,
    stop,
    reset,
  };
}
