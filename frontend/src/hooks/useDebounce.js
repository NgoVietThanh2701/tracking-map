import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value
 * @param {*} value - The value to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {*} The debounced value
 */
export function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
