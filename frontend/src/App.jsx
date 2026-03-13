import { useRef, useEffect, useState } from "react";
import MapView from "./components/MapView";
import InfoPanel from "./components/InfoPanel";
import SimulationMarkers from "./components/SimulationMarkers";
import { useDevices } from "./hooks/useDevices";
import { useOsrmRoute } from "./hooks/useOsrmRoute";
import { useSimulation } from "./hooks/useSimulation";
import { MAP_CONFIG } from "./constants";

function App() {
  const {
    devices,
    addDevice,
    removeDevice,
    selectDevice,
    deselectDevice,
    getSelectedDevice,
  } = useDevices();
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

  useEffect(() => {
    if (selectedDevice && mapRef.current) {
      mapRef.current.centerToDevice(
        selectedDevice.latitude,
        selectedDevice.longitude,
      );
    }

    // Đồng bộ thiết bị đang chọn sang mô phỏng
    if (selectedDevice) {
      setSimDevice(selectedDevice);
    }
  }, [selectedDevice]);

  // Theo dõi và giữ trung tâm map theo vị trí mô phỏng
  useEffect(() => {
    if (!simPosition || !mapRef.current) return;
    const [lat, lng] = simPosition;
    mapRef.current.centerToDevice(lat, lng);
  }, [simPosition]);

  // Tự động build route mô phỏng khi đã chọn cả thiết bị và điểm đến
  useEffect(() => {
    if (!simDevice || !simDestination) return;

    getRoute({
      from: { lat: simDevice.latitude, lng: simDevice.longitude },
      to: { lat: simDestination.lat, lng: simDestination.lng },
    });
  }, [simDevice, simDestination, getRoute]);

  const handleSimStart = (latlngs, durationSeconds) => {
    if (!Array.isArray(latlngs) || latlngs.length < 2) return;
    startSimulation(latlngs, durationSeconds);
  };

  const handleSimStop = () => {
    stopSimulation();
  };

  const handleSimReset = () => {
    resetSimulation();
    clearRoute();
    setSimDestination(null);
  };

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
        routeLoading={routeLoading}
        routeError={routeError}
        routeResult={route}
        devices={devices}
        onAddDevice={addDevice}
        onRemoveDevice={removeDevice}
        onSelectDevice={selectDevice}
        onDeselectDevice={deselectDevice}
        selectedDevice={selectedDevice}
        simDevice={simDevice}
        onSimDeviceSelect={setSimDevice}
        simDestination={simDestination}
        onSimDestinationSelect={setSimDestination}
        simPlaying={simPlaying}
        onSimStart={handleSimStart}
        onSimStop={handleSimStop}
        onSimReset={handleSimReset}
        simRoute={route}
      />
    </div>
  );
}

export default App;
