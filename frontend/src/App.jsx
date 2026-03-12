import { useDevices } from "./hooks/useDevices";
import MapView from "./components/MapView";
import InfoPanel from "./components/InfoPanel";
import { useRef, useEffect, useState } from "react";
import { useOsrmRoute } from "./hooks/useOsrmRoute";
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
  const mapRef = useRef(null);

  const selectedDevice = getSelectedDevice();
  const defaultCenter = [21.0285, 105.8542]; // Hà Nội

  useEffect(() => {
    if (selectedDevice && mapRef.current) {
      mapRef.current.centerToDevice(
        selectedDevice.latitude,
        selectedDevice.longitude,
      );
    }
  }, [selectedDevice]);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <MapView
        ref={mapRef}
        center={defaultCenter}
        searchPlace={searchPlace}
        route={route}
        selectedDevice={selectedDevice}
      />
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
      />
    </div>
  );
}

export default App;
