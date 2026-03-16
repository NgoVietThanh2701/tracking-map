import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const MARKER_STYLES = {
  size: 32,
  anchor: [16, 40],
  popup: [0, -36],
  inner: {
    width: 24,
    height: 24,
    shadow: "0 6px 14px rgba(15,23,42,0.35)",
  },
  pin: {
    width: 6,
    height: 10,
    shadow: "0 4px 8px rgba(15,23,42,0.45)",
  },
};

function createMarkerHTML() {
  return `
    <div style="position: relative; width: ${MARKER_STYLES.size}px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <div style="width: ${MARKER_STYLES.inner.width}px; height: ${MARKER_STYLES.inner.height}px; border-radius: 9999px; background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); border: 3px solid white; box-shadow: ${MARKER_STYLES.inner.shadow}; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">●</div>
      <div style="position: absolute; bottom: 0; width: ${MARKER_STYLES.pin.width}px; height: ${MARKER_STYLES.pin.height}px; border-radius: 9999px; background: linear-gradient(to bottom, #0ea5e9, #1d4ed8); box-shadow: ${MARKER_STYLES.pin.shadow};"></div>
    </div>
  `;
}

export default function DeviceMarker({ device }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!device) return;

    const markerIcon = L.divIcon({
      className: "device-marker",
      iconSize: [MARKER_STYLES.size, 40],
      iconAnchor: MARKER_STYLES.anchor,
      popupAnchor: MARKER_STYLES.popup,
      html: createMarkerHTML(),
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([device.latitude, device.longitude]);
    } else {
      markerRef.current = L.marker([device.latitude, device.longitude], {
        icon: markerIcon,
      }).addTo(map);

      markerRef.current.bindPopup(`
        <div style="font-size: 12px; min-width: 150px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${device.name}</div>
          <div style="color: #666; margin-bottom: 4px;">ID: ${device.device_id || device.id}</div>
          <div style="color: #666; margin-bottom: 4px; font-size: 11px; max-width: 150px; word-break: break-word;">📍 ${device.address}</div>
          <div style="color: #666; font-size: 10px; margin-top: 4px;">${new Date(device.timestamp).toLocaleString("vi-VN")}</div>
        </div>
      `);
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [device, map]);

  return null;
}
