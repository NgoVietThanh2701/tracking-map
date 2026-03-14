import { useRef, useEffect, useState, useCallback } from "react";
import MapView from "./components/MapView";
import InfoPanel from "./components/InfoPanel";
import SimulationMarkers from "./components/SimulationMarkers";
import { useDevices } from "./hooks/useDevices";
import { useOsrmRoute } from "./hooks/useOsrmRoute";
import { useSimulation } from "./hooks/useSimulation";
import { MAP_CONFIG } from "./constants";

function App() {
  const { devices, addDevice, removeDevice, selectDevice, getSelectedDevice } =
    useDevices();
  const [searchPlace, setSearchPlace] = useState(null);
  const [routeFrom, setRouteFrom] = useState(null);
  const [routeTo, setRouteTo] = useState(null);
  const {
    loading: routeLoading,
    error: routeError,
    route,
    getRoute,
    clear: clearRoute,
  } = useOsrmRoute();
  const [simDevice, setSimDevice] = useState(null);
  const [simDestination, setSimDestination] = useState(null);
  const {
    playing: simPlaying,
    currentPosition: simPosition,
    start: startSimulation,
    stop: stopSimulation,
    reset: resetSimulation,
  } = useSimulation();
  const mapRef = useRef(null);

  const selectedDevice = getSelectedDevice();
  const defaultCenter = MAP_CONFIG?.DEFAULT_CENTER || [21.0285, 105.8542]; // Hà Nội

  // Center map when selected device changes (view only)
  useEffect(() => {
    if (selectedDevice && mapRef.current) {
      mapRef.current.centerToDevice(
        selectedDevice.latitude,
        selectedDevice.longitude,
      );
    }
  }, [selectedDevice]);

  // Track and center map as simulation progresses
  useEffect(() => {
    if (!simPosition || !mapRef.current) return;
    const [lat, lng] = simPosition;
    mapRef.current.centerToDevice(lat, lng);
  }, [simPosition]);

  // Automatically build simulation route when device and destination are selected
  useEffect(() => {
    if (!simDevice || !simDestination) return;

    getRoute({
      from: { lat: simDevice.latitude, lng: simDevice.longitude },
      to: { lat: simDestination.lat, lng: simDestination.lng },
    });
  }, [simDevice, simDestination, getRoute]);

  const handleSimStart = useCallback(
    (latlngs, durationSeconds) => {
      if (!Array.isArray(latlngs) || latlngs.length < 2) return;
      startSimulation(latlngs, durationSeconds);
    },
    [startSimulation],
  );

  const handleSimStop = useCallback(() => {
    stopSimulation();
  }, [stopSimulation]);

  const handleSimReset = useCallback(() => {
    resetSimulation();
    clearRoute();
    setSimDestination(null);
  }, [resetSimulation, clearRoute]);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <MapView
        ref={mapRef}
        center={defaultCenter}
        searchPlace={searchPlace}
        route={route}
        selectedDevice={selectedDevice}
        hideRouteStartPin={!!(simDevice && simDestination)}
      >
        <SimulationMarkers position={simPosition} />
      </MapView>
      <InfoPanel
        searchPlace={searchPlace}
        onSearchSelect={(place) => setSearchPlace(place)}
        routeFrom={routeFrom}
        routeTo={routeTo}
        onRouteFromSelect={setRouteFrom}
        onRouteToSelect={setRouteTo}
        onRouteBuild={() => getRoute({ from: routeFrom, to: routeTo })}
        onRouteClear={() => {
          clearRoute();
          setRouteFrom(null);
          setRouteTo(null);
        }}
        onRouteResultClear={() => clearRoute()}
        routeLoading={routeLoading}
        routeError={routeError}
        routeResult={route}
        devices={devices}
        onAddDevice={addDevice}
        onRemoveDevice={removeDevice}
        onSelectDevice={selectDevice}
        selectedDevice={selectedDevice}
        simDevice={simDevice}
        onSimDeviceSelect={setSimDevice}
        simDestination={simDestination}
        onSimDestinationSelect={setSimDestination}
        simPlaying={simPlaying}
        onSimStart={handleSimStart}
        onSimStop={handleSimStop}
        onSimReset={handleSimReset}
      />
    </div>
  );
}

export default App;
