import { useCallback, useEffect, useRef, useState } from "react";

export function useSimulation() {
  const [playing, setPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [latlngs, setLatlngs] = useState([]);
  const animationRef = useRef(null);
  const playingRef = useRef(false);
  const stateRef = useRef({
    startTime: 0,
    duration: 0,
    lastSaveTime: 0,
    onMovementSave: null,
    destination: null,
  });

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

      const state = stateRef.current;
      state.startTime = performance.now();
      state.duration = durationSeconds * 1000;
      state.lastSaveTime = 0;
      state.onMovementSave = onMovementSave;
      state.destination = destination;

      // Save initial position
      if (onMovementSave && points.length > 0) {
        const [lat, lng] = points[0];
        onMovementSave(lat, lng);
      }

      const step = (now) => {
        if (!playingRef.current) return;

        const state = stateRef.current;
        const elapsed = now - state.startTime;
        const progress =
          state.duration <= 0
            ? 1
            : Math.min(1, Math.max(0, elapsed / state.duration));

        const totalSegments = points.length - 1;
        const position = progress * totalSegments;
        const index = Math.floor(position);

        if (index >= totalSegments) {
          // Save final position with destination coordinates
          if (state.onMovementSave && state.destination) {
            const { lat, lng } = state.destination;
            state.onMovementSave(lat, lng);
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
        if (elapsed - state.lastSaveTime >= 2000) {
          state.lastSaveTime = elapsed;
          if (state.onMovementSave) {
            state.onMovementSave(lat, lng);
          }
        }

        animationRef.current = requestAnimationFrame(step);
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
