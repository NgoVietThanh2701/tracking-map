import { useState, useRef, useCallback } from "react";
import { NOMINATIM_CONFIG } from "../constants";

/**
 * Converts Nominatim API response to Place object
 * @param {object} item - Nominatim API response item
 * @returns {object|null} Place object or null if invalid
 */
function toPlace(item) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: `${item.osm_type ?? ""}${item.osm_id ?? ""}-${item.place_id ?? ""}`,
    name: item.display_name ?? "Unknown",
    lat,
    lng,
    raw: item,
  };
}

/**
 * Hook for searching locations using Nominatim API
 * @returns {object} Search state and methods
 */
export function useNominatimSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0); // Track request IDs to prevent race conditions

  const search = useCallback(async (searchQuery) => {
    if (
      !searchQuery ||
      searchQuery.trim().length < NOMINATIM_CONFIG.MIN_CHARS
    ) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Increment request ID to track this specific request
    const currentRequestId = ++requestIdRef.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = new URL(NOMINATIM_CONFIG.PROXY_PATH, window.location.origin);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", String(NOMINATIM_CONFIG.REQUEST_LIMIT));
    url.searchParams.set("q", searchQuery.trim());

    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      // Ignore response if a newer request has been made
      if (currentRequestId !== requestIdRef.current) {
        return [];
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const places = Array.isArray(data)
        ? data.map(toPlace).filter(Boolean)
        : [];

      // Only update state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setItems(places);
        setError(null);
      }

      return places;
    } catch (e) {
      if (e?.name === "AbortError") return;

      // Only update error state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setError("Không thể tìm kiếm lúc này. Vui lòng thử lại.");
        setItems([]);
      }

      throw e;
    } finally {
      // Only update loading if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return {
    loading,
    error,
    items,
    search,
  };
}
