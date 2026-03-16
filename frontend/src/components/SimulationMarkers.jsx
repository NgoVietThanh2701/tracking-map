import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const SIMULATION_MARKER_STYLES = {
  size: 28,
  anchor: [14, 32],
  inner: {
    width: 24,
    height: 24,
    shadow: "0 4px 12px rgba(0,0,0,0.25)",
  },
};

function createSimulationMarkerHTML() {
  return `
    <div style="width: ${SIMULATION_MARKER_STYLES.size}px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="width: ${SIMULATION_MARKER_STYLES.inner.width}px; height: ${SIMULATION_MARKER_STYLES.inner.height}px; border-radius: 9999px; background: #2563eb; border: 2px solid white; box-shadow: ${SIMULATION_MARKER_STYLES.inner.shadow}; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🚚</div>
    </div>
  `;
}

export default function SimulationMarkers({ position }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!position) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const [lat, lng] = position;
    const icon = L.divIcon({
      className: "",
      iconSize: [SIMULATION_MARKER_STYLES.size, 32],
      iconAnchor: SIMULATION_MARKER_STYLES.anchor,
      html: createSimulationMarkerHTML(),
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [position, map]);

  return null;
}
