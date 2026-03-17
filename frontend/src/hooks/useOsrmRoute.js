import { useCallback, useState } from "react";
import { getRoute as fetchRoute } from "../api/route";

export function useOsrmRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);

  const clear = useCallback(() => {
    setLoading(false);
    setError(null);
    setRoute(null);
  }, []);

  const getRoute = useCallback(async ({ from, to }) => {
    if (!from || !to) {
      setError("Vui lòng chọn đủ điểm A và B.");
      setRoute(null);
      return null;
    }

    if (from.lat === to.lat && from.lng === to.lng) {
      setError("Điểm A và B phải khác nhau.");
      setRoute(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRoute({ from, to });
      setRoute(data);
      return data;
    } catch (e) {
      setError(
        e?.message || "Không thể lấy tuyến đường lúc này. Vui lòng thử lại.",
      );
      setRoute(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, route, getRoute, clear };
}
