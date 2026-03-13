import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import {
  MAP_CONFIG,
  OSM_ATTRIBUTION,
  ROUTE_STYLE,
  SEARCH_MARKER,
} from "../constants";
import DeviceMarker from "./DeviceMarker";

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

function RouteLayer({ route, hideStartPin = false }) {
  const map = useMap();
  const routeRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const labelRef = useRef(null);

  const buildStartFlagIcon = () =>
    L.divIcon({
      className: "",
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 38px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        ">
          <div style="
            width: 16px;
            height: 24px;
            background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
            border-radius: 4px 10px 10px 4px;
            box-shadow: 0 4px 10px rgba(22,163,74,0.5);
            position: relative;
            top: 4px;
          "></div>
          <div style="
            position: absolute;
            bottom: 0;
            width: 3px;
            height: 26px;
            background: #166534;
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(22,101,52,0.6);
          "></div>
        </div>
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

    if (!hideStartPin) {
      startRef.current = L.marker(start, {
        icon: buildStartFlagIcon(),
      }).addTo(map);
    }
    endRef.current = L.marker(end, {
      icon: L.divIcon({
        className: "",
        iconSize: [34, 40],
        iconAnchor: [17, 40],
        html: `
          <div style="
            position: relative;
            width: 34px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
              border: 3px solid white;
              box-shadow: 0 6px 16px rgba(127,29,29,0.55);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
            ">
              ⓑ
            </div>
            <div style="
              position: absolute;
              bottom: 0;
              width: 8px;
              height: 12px;
              border-radius: 9999px;
              background: linear-gradient(to bottom, #ef4444, #b91c1c);
              box-shadow: 0 4px 10px rgba(127,29,29,0.6);
            "></div>
          </div>
        `,
      }),
    }).addTo(map);

    const km = route.distance / 1000;
    const kmText = `${km.toFixed(km >= 10 ? 1 : 2)} km`;
    labelRef.current = L.marker(mid, {
      icon: buildDistanceIcon(kmText),
      interactive: false,
    }).addTo(map);

    map.fitBounds(routeRef.current.getBounds(), { padding: [40, 40] });
  }, [route, map, hideStartPin]);

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
  (
    {
      center,
      searchPlace,
      route,
      selectedDevice,
      hideRouteStartPin = false,
      children,
    },
    ref,
  ) => {
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
          <RouteLayer route={route} hideStartPin={hideRouteStartPin} />
          {selectedDevice && <DeviceMarker device={selectedDevice} />}
          {children}
        </MapContainer>
      </div>
    );
  },
);

MapView.displayName = "MapView";
export default MapView;
