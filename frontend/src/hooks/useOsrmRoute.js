import { useCallback, useRef, useState } from "react";
import { OSRM_CONFIG } from "../constants";

// Cache expiration time in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

function toRoute(data) {
  const r = data?.routes?.[0];
  const coords = r?.geometry?.coordinates;
  if (!r || !Array.isArray(coords) || coords.length < 2) return null;

  // OSRM geojson: [lng, lat]
  const latlngs = coords.map(([lng, lat]) => [lat, lng]);

  return {
    distance: r.distance, // meters
    duration: r.duration, // seconds
    latlngs,
  };
}

function makeKey(point) {
  if (!point) return "";
  const lat = Number(point.lat ?? point.latitude ?? 0);
  const lng = Number(point.lng ?? point.longitude ?? 0);
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function useOsrmRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());
  const cacheTimestampsRef = useRef(new Map());

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setError(null);
    setRoute(null);
  }, []);

  // Clean expired cache entries and handle LRU eviction
  const cleanCache = useCallback(() => {
    const now = Date.now();
    let oldestKey = null;
    let oldestTime = now;

    for (const [key, timestamp] of cacheTimestampsRef.current.entries()) {
      if (now - timestamp > CACHE_TTL) {
        cacheRef.current.delete(key);
        cacheTimestampsRef.current.delete(key);
      } else if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }

    if (cacheRef.current.size >= MAX_CACHE_SIZE && oldestKey) {
      cacheRef.current.delete(oldestKey);
      cacheTimestampsRef.current.delete(oldestKey);
    }
  }, []);

  const getRoute = useCallback(
    async ({ from, to }) => {
      if (!from || !to) {
        setError("Vui lòng chọn đủ điểm A và B.");
        setRoute(null);
        return null;
      }

      const fromKey = makeKey(from);
      const toKey = makeKey(to);

      if (fromKey === toKey) {
        setError("Điểm A và B phải khác nhau.");
        setRoute(null);
        return null;
      }

      const cacheKey = `${fromKey}|${toKey}`;

      // Clean expired entries and handle LRU eviction in one pass
      cleanCache();

      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setError(null);
        setRoute(cached);
        return cached;
      }

      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const base = `${OSRM_CONFIG.PROXY_PATH}/${OSRM_CONFIG.PROFILE}`;
      const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
      const url = new URL(`${base}/${coords}`, window.location.origin);
      url.searchParams.set("overview", OSRM_CONFIG.OVERVIEW);
      url.searchParams.set("geometries", OSRM_CONFIG.GEOMETRIES);
      url.searchParams.set("steps", "false");

      try {
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const parsed = toRoute(data);
        if (!parsed) {
          setError("Không tìm thấy tuyến đường phù hợp.");
          setRoute(null);
          return null;
        }

        // Store route in cache with timestamp
        cacheRef.current.set(cacheKey, parsed);
        cacheTimestampsRef.current.set(cacheKey, Date.now());

        setRoute(parsed);
        return parsed;
      } catch (e) {
        if (e?.name === "AbortError") return null;
        setError("Không thể lấy tuyến đường lúc này. Vui lòng thử lại.");
        setRoute(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cleanCache],
  );

  return { loading, error, route, getRoute, clear };
}
