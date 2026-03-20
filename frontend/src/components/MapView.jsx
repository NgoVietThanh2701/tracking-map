import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import {
  MAP_CONFIG,
  OSM_ATTRIBUTION,
  ROUTE_STYLE,
  SEARCH_MARKER,
} from "../constants";
import {
  buildStartFlagIcon,
  buildEndPinIcon,
  buildDistanceIcon,
} from "../constants/markerIcons";
import { cleanupMapLayers } from "../utils/mapCleanup";
import DeviceMarker from "./DeviceMarker";
import HistoryRoute from "./HistoryRoute";
import { formatDistance } from "../utils/format";

function SearchMarker({ searchPlace }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!searchPlace) {
      cleanupMapLayers(map, markerRef);
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

  useEffect(() => {
    if (!route) {
      cleanupMapLayers(map, routeRef, startRef, endRef, labelRef);
      return;
    }

    cleanupMapLayers(map, routeRef, startRef, endRef, labelRef);

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
      icon: buildEndPinIcon(),
    }).addTo(map);

    const kmText = `${formatDistance(route.distance)} km`;
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
      historyData,
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
          minZoom={12}
          maxZoom={16}
          className="h-full w-full"
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer url={MAP_CONFIG.TILE_URL} attribution={OSM_ATTRIBUTION} />
          <MapInstanceBinder mapRef={mapInstanceRef} />
          <SearchMarker searchPlace={searchPlace} />
          <RouteLayer route={route} hideStartPin={hideRouteStartPin} />
          <HistoryRoute historyData={historyData} />
          {selectedDevice && <DeviceMarker device={selectedDevice} />}
          {children}
        </MapContainer>
      </div>
    );
  },
);

MapView.displayName = "MapView";
export default MapView;
