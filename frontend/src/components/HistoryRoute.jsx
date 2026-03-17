import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { ROUTE_STYLE } from "../constants";
import {
  buildStartFlagIcon,
  buildEndPinIcon,
  buildDistanceIcon,
  createSequenceMarkerIcon,
} from "../constants/markerIcons";
import { cleanupMapLayers } from "../utils/mapCleanup";
import { formatDistance } from "../utils/format";

export default function HistoryRoute({ historyData }) {
  const map = useMap();
  const routeRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const labelRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Clear previous layers
    cleanupMapLayers(map, routeRef, startRef, endRef, labelRef);
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    if (!historyData?.latlngs || historyData.latlngs.length < 2) {
      return;
    }

    // Draw route polyline using standard route style
    routeRef.current = L.polyline(historyData.latlngs, ROUTE_STYLE).addTo(map);

    const start = historyData.latlngs[0];
    const end = historyData.latlngs[historyData.latlngs.length - 1];
    const mid = historyData.latlngs[Math.floor(historyData.latlngs.length / 2)];

    // Add start flag
    startRef.current = L.marker(start, {
      icon: buildStartFlagIcon(),
    }).addTo(map);

    // Add end pin
    endRef.current = L.marker(end, {
      icon: buildEndPinIcon(),
    }).addTo(map);

    // Add distance label
    const kmText = `${formatDistance(historyData.distance)} km`;
    labelRef.current = L.marker(mid, {
      icon: buildDistanceIcon(kmText),
      interactive: false,
    }).addTo(map);

    // Add sequence markers (for all points except first and last, or for all if needed)
    historyData.records?.forEach((record, index) => {
      const isFirst = index === 0;
      const isLast = index === historyData.records.length - 1;

      // Only show sequence markers for intermediate points
      if (isFirst || isLast) {
        return;
      }

      const icon = createSequenceMarkerIcon(index);
      const marker = L.marker([record.latitude, record.longitude], {
        icon,
      }).addTo(map);

      const date = new Date(record.timestamp);
      const timeStr = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const coordStr = `${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}`;

      marker.bindTooltip(
        `<div style="text-align: center;"><strong>${timeStr}</strong><br/>${coordStr}</div>`,
        { direction: "top", offset: [0, -10], opacity: 0.95 },
      );

      markersRef.current.push(marker);
    });

    // Fit bounds
    if (routeRef.current) {
      map.fitBounds(routeRef.current.getBounds(), { padding: [40, 40] });
    }

    return () => {
      cleanupMapLayers(map, routeRef, startRef, endRef, labelRef);
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];
    };
  }, [historyData, map]);

  return null;
}
