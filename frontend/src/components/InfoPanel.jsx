import { useMemo, useState, useEffect } from "react";
import AutoComplete from "./AutoComplete";
import DeviceForm from "./DeviceForm";
import DeviceList from "./DeviceList";
import {
  TABS,
  PANEL_TITLES,
  SEARCH_PANEL_LABELS,
  SIMULATION_PANEL_LABELS,
} from "../constants";

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full h-11 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-gray-700 text-white" : "text-gray-700 hover:bg-gray-100",
      ].join(" ")}
      aria-pressed={active}
      aria-label={label}
    >
      <span className="text-lg" aria-hidden>
        {icon}
      </span>
      <span className="pointer-events-none absolute left-full ml-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs font-medium px-2 py-1 shadow-lg">
        {label}
      </span>
    </button>
  );
}

function PanelHeader({ title, subtitle }) {
  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {subtitle ? (
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function InfoPanel({
  searchPlace,
  onSearchSelect,
  routeFrom,
  routeTo,
  onRouteFromSelect,
  onRouteToSelect,
  onRouteBuild,
  onRouteClear,
  routeLoading,
  routeError,
  routeResult,
  devices = [],
  onAddDevice,
  onRemoveDevice,
  onSelectDevice,
  selectedDevice,
  simDevice,
  onSimDeviceSelect,
  simDestination,
  onSimDestinationSelect,
  simPlaying,
  onSimStart,
  onSimStop,
  onSimReset,
  simRoute,
}) {
  const [activeTab, setActiveTab] = useState("devices");
  const [routeReset, setRouteReset] = useState(0);
  const [simDuration, setSimDuration] = useState(10);
  const [isFindingRoute, setIsFindingRoute] = useState(false);

  // Auto-load selected device to simulation when switching to simulation tab
  useEffect(() => {
    if (activeTab === "simulation" && selectedDevice && !simDevice) {
      onSimDeviceSelect?.(selectedDevice);
    }
  }, [activeTab, selectedDevice, simDevice, onSimDeviceSelect]);

  // Reset destination, speed và trạng thái mô phỏng khi rời tab mô phỏng
  useEffect(() => {
    if (activeTab !== "simulation") {
      setSimDuration(10);
      onSimReset?.();
    }
  }, [activeTab]);

  const isSearchRouteButtonDisabled =
    !routeFrom || !routeTo || routeLoading || !!routeResult;

  const header = useMemo(() => {
    switch (activeTab) {
      case "devices":
        return PANEL_TITLES.DEVICES;
      case "search":
        return PANEL_TITLES.SEARCH;
      case "simulation":
        return PANEL_TITLES.SIMULATION;
      default:
        return PANEL_TITLES.SEARCH;
    }
  }, [activeTab]);

  return (
    <div className="absolute left-0 top-0 z-1000 w-115 max-w-[96vw]">
      <div className="max-h-[92vh] bg-white/95 backdrop-blur shadow-lg border-r border-b border-gray-200/80 overflow-hidden flex rounded-br-xl">
        <div className="w-14 p-2 border-r border-gray-200 bg-white/70 flex flex-col gap-1">
          {TABS.map((t) => (
            <TabButton
              key={t.id}
              active={activeTab === t.id}
              icon={t.icon}
              label={t.label}
              onClick={() => setActiveTab(t.id)}
            />
          ))}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <PanelHeader title={header.title} subtitle={header.subtitle} />

          <div className="p-4 flex flex-col max-h-[72vh]">
            {activeTab === "devices" ? (
              <div className="flex flex-col h-full">
                <div className="shrink-0 px-4">
                  <DeviceForm onAddDevice={onAddDevice} />
                </div>
                <div className="flex-1 overflow-y-auto min-w-0 border-t border-gray-200 pt-3 mt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 px-4">
                    Danh sách thiết bị ({devices.length})
                  </h3>
                  <div className="px-4">
                    <DeviceList
                      devices={devices}
                      onSelectDevice={onSelectDevice}
                      onRemove={onRemoveDevice}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "search" ? (
              <div className="space-y-3">
                {!isFindingRoute ? (
                  <>
                    <AutoComplete
                      label={SEARCH_PANEL_LABELS.INPUT_LABEL}
                      placeholder={SEARCH_PANEL_LABELS.INPUT_PLACEHOLDER}
                      onSelect={(place) => {
                        onSearchSelect?.(place);
                      }}
                      onClear={() => onSearchSelect?.(null)}
                    />
                    <p className="text-xs text-gray-500">
                      {SEARCH_PANEL_LABELS.HELP_TEXT}
                    </p>

                    {searchPlace ? (
                      <div className="mt-1 text-xs text-gray-500">
                        {SEARCH_PANEL_LABELS.SELECTED}{" "}
                        <span className="text-gray-900">
                          {searchPlace.name}
                        </span>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setIsFindingRoute(true)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      🧭 {SEARCH_PANEL_LABELS.FIND_ROUTE_LABEL}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <AutoComplete
                        key={`route-from-${routeReset}`}
                        label={SEARCH_PANEL_LABELS.FROM_LABEL}
                        placeholder={SEARCH_PANEL_LABELS.FROM_PLACEHOLDER}
                        onSelect={(place) => onRouteFromSelect?.(place)}
                        onClear={() => onRouteFromSelect?.(null)}
                      />
                    </div>

                    <AutoComplete
                      key={`route-to-${routeReset}`}
                      label={SEARCH_PANEL_LABELS.TO_LABEL}
                      placeholder={SEARCH_PANEL_LABELS.TO_PLACEHOLDER}
                      onSelect={(place) => onRouteToSelect?.(place)}
                      onClear={() => onRouteToSelect?.(null)}
                    />

                    <button
                      type="button"
                      onClick={onRouteBuild}
                      disabled={isSearchRouteButtonDisabled}
                      className={[
                        "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors",
                        isSearchRouteButtonDisabled
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-gray-800",
                      ].join(" ")}
                    >
                      {routeLoading
                        ? SEARCH_PANEL_LABELS.FINDING
                        : SEARCH_PANEL_LABELS.FIND_BUTTON}
                    </button>

                    <div className="rounded-lg border border-gray-200 p-3 text-sm">
                      {routeError ? (
                        <p className="text-red-600">{routeError}</p>
                      ) : routeResult ? (
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {SEARCH_PANEL_LABELS.ROUTE_INFO}
                          </div>
                          <div className="text-gray-600">
                            {SEARCH_PANEL_LABELS.DISTANCE}{" "}
                            <span className="font-medium">
                              {(routeResult.distance / 1000).toFixed(
                                routeResult.distance >= 10000 ? 1 : 2,
                              )}{" "}
                              {SEARCH_PANEL_LABELS.KM}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {SEARCH_PANEL_LABELS.DURATION}{" "}
                            <span className="font-medium">
                              {Math.round(routeResult.duration / 60)}{" "}
                              {SEARCH_PANEL_LABELS.MINUTES}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          {SEARCH_PANEL_LABELS.NO_SELECTION}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRouteReset((v) => v + 1);
                        onRouteClear?.();
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {SEARCH_PANEL_LABELS.CLEAR_BUTTON}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFindingRoute(false)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Quay lại
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {activeTab === "simulation" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2">
                    {SIMULATION_PANEL_LABELS.DEVICE_LABEL}
                  </label>
                  <select
                    value={simDevice ? simDevice.id : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      onSimReset?.();

                      if (value) {
                        const device = devices.find((d) => d.id === value);
                        if (device) {
                          onSimDeviceSelect?.(device);
                          onSelectDevice?.(device.id);
                        }
                      } else {
                        onSimDeviceSelect?.(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  >
                    <option value="">
                      {SIMULATION_PANEL_LABELS.DEVICE_PLACEHOLDER}
                    </option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.device_id || device.id})
                      </option>
                    ))}
                  </select>
                </div>

                {simDevice && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                    <div className="text-xs font-medium text-gray-600">
                      Điểm bắt đầu:
                    </div>
                    <div className="font-medium mt-1">{simDevice.name}</div>
                    <div className="text-xs text-gray-600">
                      {simDevice.address}
                    </div>
                  </div>
                )}

                <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                  <AutoComplete
                    key={`sim-dest-${simDevice?.id}`}
                    label={SIMULATION_PANEL_LABELS.DESTINATION_LABEL}
                    placeholder={
                      SIMULATION_PANEL_LABELS.DESTINATION_PLACEHOLDER
                    }
                    onSelect={(place) => onSimDestinationSelect?.(place)}
                    onClear={() => {
                      onSimDestinationSelect?.(null);
                      onSimReset?.();
                    }}
                  />

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {SIMULATION_PANEL_LABELS.SPEED_LABEL}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={simDuration}
                        onChange={(e) => setSimDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={simPlaying}
                      />
                    </div>
                  </div>

                  {simDevice && simDestination && routeLoading && !simRoute && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="px-4 py-3 rounded-xl bg-white/95 shadow-lg border border-yellow-300 text-xs font-semibold text-yellow-800">
                        Đang tìm tuyến đường mô phỏng...
                      </div>
                    </div>
                  )}
                </div>

                {simPlaying ? (
                  <button
                    type="button"
                    onClick={onSimStop}
                    className="w-full px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    {SIMULATION_PANEL_LABELS.STOP_BUTTON}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        simRoute &&
                        simRoute.latlngs &&
                        simRoute.latlngs.length > 0
                      ) {
                        onSimStart?.(simRoute.latlngs, simDuration);
                      }
                    }}
                    disabled={
                      !simRoute ||
                      !simRoute.latlngs ||
                      simRoute.latlngs.length === 0
                    }
                    className={[
                      "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors",
                      !simRoute ||
                      !simRoute.latlngs ||
                      simRoute.latlngs.length === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700",
                    ].join(" ")}
                  >
                    {SIMULATION_PANEL_LABELS.PLAY_BUTTON}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSimReset?.();
                    onSimDeviceSelect?.(null);
                    onSimDestinationSelect?.(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Đặt lại
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
