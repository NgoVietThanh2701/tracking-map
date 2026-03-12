import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import {
  LOCATION_MARKER,
  MAP_CONFIG,
  OSM_ATTRIBUTION,
  ROUTE_STYLE,
  SEARCH_MARKER,
} from "../constants";
import DeviceMarker from "./DeviceMarker";

function LocationMarker({ position, permission }) {
  const map = useMap();
  const markerRef = useRef(null);

  const defaultIcon = L.icon(LOCATION_MARKER);

  useEffect(() => {
    if (!position || permission !== "granted") return;

    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng]);
    } else {
      markerRef.current = L.marker([position.lat, position.lng], {
        icon: defaultIcon,
      }).addTo(map);
    }
  }, [position, permission, map, defaultIcon]);

  return null;
}

function SearchMarker({ searchPlace }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    // remove marker if search place is cleared
    if (!searchPlace) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const latlng = [searchPlace.lat, searchPlace.lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.circleMarker(latlng, {
        ...SEARCH_MARKER,
      }).addTo(map);
    }

    markerRef.current.bindTooltip(searchPlace.name, {
      direction: "top",
      offset: [0, -8],
      opacity: 0.9,
      sticky: true,
    });

    map.setView(latlng, Math.max(map.getZoom(), MAP_CONFIG.SEARCH_ZOOM), {
      animate: true,
    });
  }, [searchPlace, map]);

  return null;
}

function RouteLayer({ route }) {
  const map = useMap();
  const routeRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const labelRef = useRef(null);

  const buildPinIcon = (text, kind) =>
    L.divIcon({
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      html: `
        <div style="
          width:34px;height:34px;border-radius:9999px;
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:700;font-size:12px;
          box-shadow:0 6px 18px rgba(0,0,0,.25);
          border:2px solid rgba(255,255,255,.95);
          background:${kind === "start" ? "#16a34a" : "#dc2626"};
        ">${text}</div>
      `,
    });

  const buildDistanceIcon = (kmText) =>
    L.divIcon({
      className: "",
      iconSize: [120, 32],
      iconAnchor: [60, 16],
      html: `
        <div style="
          padding:6px 10px;border-radius:9999px;
          background:rgba(255,255,255,.95);
          border:1px solid rgba(15,23,42,.15);
          box-shadow:0 6px 18px rgba(0,0,0,.12);
          font-size:12px;font-weight:600;color:#0f172a;
          white-space:nowrap;
        ">${kmText}</div>
      `,
    });

  useEffect(() => {
    if (!route) {
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
        routeRef.current = null;
      }
      if (startRef.current) {
        map.removeLayer(startRef.current);
        startRef.current = null;
      }
      if (endRef.current) {
        map.removeLayer(endRef.current);
        endRef.current = null;
      }
      if (labelRef.current) {
        map.removeLayer(labelRef.current);
        labelRef.current = null;
      }
      return;
    }

    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (startRef.current) {
      map.removeLayer(startRef.current);
      startRef.current = null;
    }
    if (endRef.current) {
      map.removeLayer(endRef.current);
      endRef.current = null;
    }
    if (labelRef.current) {
      map.removeLayer(labelRef.current);
      labelRef.current = null;
    }

    routeRef.current = L.polyline(route.latlngs, ROUTE_STYLE).addTo(map);

    const start = route.latlngs[0];
    const end = route.latlngs[route.latlngs.length - 1];
    const mid = route.latlngs[Math.floor(route.latlngs.length / 2)];

    startRef.current = L.marker(start, {
      icon: buildPinIcon("A", "start"),
    }).addTo(map);
    endRef.current = L.marker(end, { icon: buildPinIcon("B", "end") }).addTo(
      map,
    );

    const km = route.distance / 1000;
    const kmText = `${km.toFixed(km >= 10 ? 1 : 2)} km`;
    labelRef.current = L.marker(mid, {
      icon: buildDistanceIcon(kmText),
      interactive: false,
    }).addTo(map);

    map.fitBounds(routeRef.current.getBounds(), { padding: [40, 40] });
  }, [route, map]);

  return null;
}

function MapInstanceBinder({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

const MapView = forwardRef(
  ({ center, searchPlace, route, selectedDevice, children }, ref) => {
    const mapInstanceRef = useRef(null);

    useImperativeHandle(
      ref,
      () => ({
        centerToDevice: (lat, lng) => {
          if (!mapInstanceRef.current) return;
          mapInstanceRef.current.setView([lat, lng], MAP_CONFIG.SEARCH_ZOOM, {
            animate: true,
          });
        },
      }),
      [],
    );

    return (
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={MAP_CONFIG.DEFAULT_ZOOM}
          className="h-full w-full"
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer url={MAP_CONFIG.TILE_URL} attribution={OSM_ATTRIBUTION} />
          <MapInstanceBinder mapRef={mapInstanceRef} />
          <SearchMarker searchPlace={searchPlace} />
          <RouteLayer route={route} />
          {selectedDevice && <DeviceMarker device={selectedDevice} />}
          {children}
        </MapContainer>
      </div>
    );
  },
);

MapView.displayName = "MapView";
export default MapView;
