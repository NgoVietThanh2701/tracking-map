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
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -36],
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%);
            border: 3px solid white;
            box-shadow: 0 6px 14px rgba(15,23,42,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
          ">
            ●
          </div>
          <div style="
            position: absolute;
            bottom: 0;
            width: 6px;
            height: 10px;
            border-radius: 9999px;
            background: linear-gradient(to bottom, #0ea5e9, #1d4ed8);
            box-shadow: 0 4px 8px rgba(15,23,42,0.45);
          "></div>
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
          <div style="color: #666; margin-bottom: 4px;">ID: ${device.device_id || device.id}</div>
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
