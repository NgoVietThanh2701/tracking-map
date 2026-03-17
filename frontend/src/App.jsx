import { useRef, useEffect, useState, useCallback } from "react";
import MapView from "./components/MapView";
import InfoPanel from "./components/InfoPanel";
import SimulationMarkers from "./components/SimulationMarkers";
import { useDevices } from "./hooks/useDevices";
import { useOsrmRoute } from "./hooks/useOsrmRoute";
import { useSimulation } from "./hooks/useSimulation";
import { useMovementHistory } from "./hooks/useMovementHistory";
import { MAP_CONFIG } from "./constants";

function App() {
  const {
    devices,
    loading: deviceLoading,
    error: deviceError,
    addDevice,
    removeDevice,
    selectDevice,
    getSelectedDevice,
    updateDevice,
    saveMovementRecord,
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
  const [simDestination, setSimDestination] = useState(null);
  const {
    playing: simPlaying,
    currentPosition: simPosition,
    start: startSimulation,
    reset: resetSimulation,
  } = useSimulation();
  const {
    loading: historyLoading,
    error: historyError,
    historyData,
    getHistoryRoute,
    clearHistory,
  } = useMovementHistory();
  const mapRef = useRef(null);
  const previousSimPlayingRef = useRef(false);
  const shouldResetSimDestinationRef = useRef(false);

  // State for history time range
  const [historyStartTime, setHistoryStartTime] = useState(null);
  const [historyEndTime, setHistoryEndTime] = useState(null);
  const [historyPlaybackDuration, setHistoryPlaybackDuration] = useState(10);

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
  }, [selectedDevice?.id]);

  // Track and center map as simulation progresses
  useEffect(() => {
    if (!simPosition || !mapRef.current) return;
    const [lat, lng] = simPosition;
    mapRef.current.centerToDevice(lat, lng);
  }, [simPosition]);

  // Automatically build simulation route when device and destination are selected
  useEffect(() => {
    if (!selectedDevice || !simDestination) return;

    getRoute({
      from: { lat: selectedDevice.latitude, lng: selectedDevice.longitude },
      to: { lat: simDestination.lat, lng: simDestination.lng },
    });
  }, [selectedDevice, simDestination, getRoute]);

  // Handle simulation completion
  useEffect(() => {
    // Check if simulation just finished (transitioned from playing to not playing)
    if (
      previousSimPlayingRef.current &&
      !simPlaying &&
      selectedDevice &&
      simDestination
    ) {
      // Simulation finished, update device location and address
      updateDevice(selectedDevice.id, {
        address: simDestination.name,
        latitude: simDestination.lat,
        longitude: simDestination.lng,
      }).catch((err) => {
        console.error("Failed to update device after simulation:", err);
      });
      clearRoute();
      shouldResetSimDestinationRef.current = true;
    }
    previousSimPlayingRef.current = simPlaying;
  }, [simPlaying, selectedDevice, simDestination, updateDevice, clearRoute]);

  // Reset simulation state after route is cleared
  useEffect(() => {
    if (!route && shouldResetSimDestinationRef.current) {
      // Defer setState to avoid cascading renders warning
      const timer = setTimeout(() => {
        setSimDestination(null);
        shouldResetSimDestinationRef.current = false;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [route]);

  const handleSimStart = useCallback(
    (latlngs, durationSeconds) => {
      if (
        !Array.isArray(latlngs) ||
        latlngs.length < 2 ||
        !selectedDevice ||
        !simDestination
      )
        return;

      const onMovementSave = (lat, lng) => {
        saveMovementRecord(selectedDevice.id, lat, lng);
      };

      startSimulation(latlngs, durationSeconds, onMovementSave, simDestination);
    },
    [startSimulation, selectedDevice, simDestination, saveMovementRecord],
  );

  const handleSimReset = useCallback(() => {
    resetSimulation();
    clearRoute();
    setSimDestination(null);
  }, [resetSimulation, clearRoute]);

  const handleHistoryPlayClick = useCallback(
    (historyData) => {
      if (
        !historyData ||
        !historyData.latlngs ||
        historyData.latlngs.length < 2
      )
        return;

      // For history playback, don't save records and don't update device location
      const noop = () => {};

      startSimulation(
        historyData.latlngs,
        historyPlaybackDuration,
        noop,
        undefined,
      );
    },
    [startSimulation, historyPlaybackDuration],
  );

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <MapView
        ref={mapRef}
        center={defaultCenter}
        searchPlace={searchPlace}
        route={route}
        selectedDevice={selectedDevice}
        hideRouteStartPin={!!(selectedDevice && simDestination)}
        historyData={historyData}
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
        deviceLoading={deviceLoading}
        deviceError={deviceError}
        onAddDevice={addDevice}
        onRemoveDevice={removeDevice}
        onSelectDevice={selectDevice}
        selectedDevice={selectedDevice}
        simDevice={selectedDevice}
        simDestination={simDestination}
        onSimDestinationSelect={setSimDestination}
        simPlaying={simPlaying}
        onSimStart={handleSimStart}
        onSimReset={handleSimReset}
        historyDevice={selectedDevice}
        historyStartTime={historyStartTime}
        onHistoryStartTimeChange={setHistoryStartTime}
        historyEndTime={historyEndTime}
        onHistoryEndTimeChange={setHistoryEndTime}
        historyLoading={historyLoading}
        historyError={historyError}
        historyData={historyData}
        onHistorySearch={getHistoryRoute}
        onHistoryClear={clearHistory}
        onHistoryPlayClick={handleHistoryPlayClick}
        historyPlaybackDuration={historyPlaybackDuration}
        onHistoryPlaybackDurationChange={setHistoryPlaybackDuration}
      />
    </div>
  );
}

export default App;
