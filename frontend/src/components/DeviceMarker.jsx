import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function DeviceMarker({ device }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!device) return;

    const markerIcon = L.divIcon({
      className: "device-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 16px;
        ">
          📱
        </div>
      `,
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
          <div style="color: #666; margin-bottom: 4px;">ID: ${device.device_id}</div>
          <div style="color: #666; margin-bottom: 4px; font-size: 11px; max-width: 150px; word-break: break-word;">
            📍 ${device.address}
          </div>
          <div style="color: #666; font-size: 10px; margin-top: 4px;">
            ${new Date(device.timestamp).toLocaleString("vi-VN")}
          </div>
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
