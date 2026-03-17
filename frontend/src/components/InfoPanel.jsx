import { useMemo, useState, useEffect } from "react";
import AutoComplete from "./AutoComplete";
import DeviceForm from "./DeviceForm";
import DeviceList from "./DeviceList";
import DeviceSelector from "./DeviceSelector";
import ResultCard from "./ResultCard";
import {
  TABS,
  PANEL_TITLES,
  SEARCH_PANEL_LABELS,
  SIMULATION_PANEL_LABELS,
  HISTORY_PANEL_LABELS,
} from "../constants";
import {
  formatDistance,
  formatDurationSeconds,
  formatDurationMilliseconds,
} from "../utils/format";

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
  onRouteResultClear,
  routeLoading,
  routeError,
  routeResult,
  devices = [],
  deviceLoading = false,
  deviceError = null,
  onAddDevice,
  onRemoveDevice,
  onSelectDevice,
  simDevice,
  simDestination,
  onSimDestinationSelect,
  simPlaying,
  onSimStart,
  onSimReset,
  historyDevice,
  historyStartTime,
  onHistoryStartTimeChange,
  historyEndTime,
  onHistoryEndTimeChange,
  historyLoading,
  historyError,
  historyData,
  onHistorySearch,
  onHistoryClear,
  onHistoryPlayClick,
  historyPlaybackDuration,
  onHistoryPlaybackDurationChange,
}) {
  const [activeTab, setActiveTab] = useState("devices");
  const [simDuration, setSimDuration] = useState(10);
  const [isFindingRoute, setIsFindingRoute] = useState(false);

  // Set default history time range when switching to history tab
  useEffect(() => {
    if (activeTab === "history") {
      const formatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      const formatTime = (date) => {
        const parts = formatter.formatToParts(date);
        return parts
          .map(({ type, value }) =>
            type === "literal" && value === " " ? "T" : value,
          )
          .join("")
          .slice(0, 16);
      };
      onHistoryStartTimeChange?.(
        formatTime(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      );
      onHistoryEndTimeChange?.(formatTime(new Date()));
    }
  }, [activeTab, onHistoryStartTimeChange, onHistoryEndTimeChange]);

  // Clear route when navigating to devices tab
  useEffect(() => {
    if (activeTab === "devices") {
      onRouteClear?.();
    }
  }, [activeTab, onRouteClear]);

  // Reset route UI when leaving search tab
  useEffect(() => {
    return () => {
      if (activeTab === "search") {
        setIsFindingRoute(false);
      }
    };
  }, [activeTab]);

  // Reset simulation when leaving simulation tab
  useEffect(() => {
    return () => {
      if (activeTab === "simulation") {
        setSimDuration(10);
        onSimReset?.();
      }
    };
  }, [activeTab, onSimReset]);

  // Clear history when leaving history tab
  useEffect(() => {
    return () => {
      if (activeTab === "history") {
        onHistoryClear?.();
      }
    };
  }, [activeTab, onHistoryClear]);

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
      case "history":
        return PANEL_TITLES.HISTORY;
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
                {deviceError && (
                  <div className="mx-4 mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {deviceError}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto min-w-0 border-t border-gray-200 pt-3 mt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 px-4">
                    Danh sách thiết bị ({devices.length})
                  </h3>
                  <div className="px-4">
                    {deviceLoading ? (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">
                          Đang tải danh sách thiết bị...
                        </p>
                      </div>
                    ) : (
                      <DeviceList
                        devices={devices}
                        onSelectDevice={onSelectDevice}
                        onRemove={onRemoveDevice}
                      />
                    )}
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
                        label={SEARCH_PANEL_LABELS.FROM_LABEL}
                        placeholder={SEARCH_PANEL_LABELS.FROM_PLACEHOLDER}
                        onSelect={(place) => onRouteFromSelect?.(place)}
                        onClear={() => {
                          onRouteFromSelect?.(null);
                          onRouteResultClear?.();
                        }}
                      />
                    </div>

                    <AutoComplete
                      label={SEARCH_PANEL_LABELS.TO_LABEL}
                      placeholder={SEARCH_PANEL_LABELS.TO_PLACEHOLDER}
                      onSelect={(place) => onRouteToSelect?.(place)}
                      onClear={() => {
                        onRouteToSelect?.(null);
                        onRouteResultClear?.();
                      }}
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

                    {routeResult && (
                      <ResultCard
                        error={routeError}
                        data={routeResult}
                        emptyMessage={SEARCH_PANEL_LABELS.NO_SELECTION}
                      >
                        <div className="font-medium text-gray-900">
                          {SEARCH_PANEL_LABELS.ROUTE_INFO}
                        </div>
                        <div className="text-gray-600">
                          {SEARCH_PANEL_LABELS.DISTANCE}{" "}
                          <span className="font-medium">
                            {formatDistance(routeResult.distance)}{" "}
                            {SEARCH_PANEL_LABELS.KM}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {SEARCH_PANEL_LABELS.DURATION}{" "}
                          <span className="font-medium">
                            {formatDurationSeconds(routeResult.duration)}{" "}
                            {SEARCH_PANEL_LABELS.MINUTES}
                          </span>
                        </div>
                      </ResultCard>
                    )}

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
                <DeviceSelector
                  value={simDevice}
                  onChange={(device) => {
                    if (device) {
                      onSimReset?.();
                      onSelectDevice?.(device.id);
                    }
                  }}
                  devices={devices}
                  label={SIMULATION_PANEL_LABELS.DEVICE_LABEL}
                  placeholder={SIMULATION_PANEL_LABELS.DEVICE_PLACEHOLDER}
                />

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

                  {simDevice &&
                    simDestination &&
                    routeLoading &&
                    !routeResult && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="px-4 py-3 rounded-xl bg-white/95 shadow-lg border border-yellow-300 text-xs font-semibold text-yellow-800">
                          Đang tìm tuyến đường mô phỏng...
                        </div>
                      </div>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      routeResult &&
                      routeResult.latlngs &&
                      routeResult.latlngs.length > 0
                    ) {
                      onSimStart?.(routeResult.latlngs, simDuration);
                    }
                  }}
                  disabled={
                    !routeResult ||
                    !routeResult.latlngs ||
                    routeResult.latlngs.length === 0 ||
                    simPlaying
                  }
                  className={[
                    "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors",
                    !routeResult ||
                    !routeResult.latlngs ||
                    routeResult.latlngs.length === 0 ||
                    simPlaying
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700",
                  ].join(" ")}
                >
                  {simPlaying
                    ? SIMULATION_PANEL_LABELS.PLAYING
                    : SIMULATION_PANEL_LABELS.PLAY_BUTTON}
                </button>
              </div>
            ) : null}

            {activeTab === "history" ? (
              <div className="space-y-3 flex flex-col h-full">
                <div
                  className={simPlaying ? "opacity-50 pointer-events-none" : ""}
                >
                  <DeviceSelector
                    value={historyDevice}
                    onChange={(device) => {
                      if (device) {
                        onSelectDevice?.(device.id);
                        onHistoryClear?.();
                      }
                    }}
                    devices={devices}
                    label={HISTORY_PANEL_LABELS.DEVICE_LABEL}
                    placeholder={HISTORY_PANEL_LABELS.DEVICE_PLACEHOLDER}
                  />
                </div>

                <div
                  className={`space-y-2 shrink-0 ${simPlaying ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {HISTORY_PANEL_LABELS.START_TIME_LABEL}
                    </label>
                    <input
                      type="datetime-local"
                      value={historyStartTime || ""}
                      onChange={(e) =>
                        onHistoryStartTimeChange?.(e.target.value)
                      }
                      disabled={simPlaying}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {HISTORY_PANEL_LABELS.END_TIME_LABEL}
                    </label>
                    <input
                      type="datetime-local"
                      value={historyEndTime || ""}
                      onChange={(e) => onHistoryEndTimeChange?.(e.target.value)}
                      disabled={simPlaying}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (historyDevice) {
                      onHistorySearch?.(
                        historyDevice.id,
                        historyStartTime,
                        historyEndTime,
                      );
                    }
                  }}
                  disabled={!historyDevice || historyLoading || simPlaying}
                  className={[
                    "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors shrink-0 cursor-pointer",
                    !historyDevice || historyLoading || simPlaying
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700",
                  ].join(" ")}
                >
                  {historyLoading
                    ? HISTORY_PANEL_LABELS.SEARCHING
                    : HISTORY_PANEL_LABELS.SEARCH_BUTTON}
                </button>

                <div className="flex-1 overflow-y-auto min-w-0 min-h-0">
                  {historyError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-600">{historyError}</p>
                    </div>
                  ) : historyData ? (
                    <>
                      <div className="rounded-lg border border-gray-200 p-3 space-y-2 text-sm">
                        <div className="font-medium text-gray-900">
                          {HISTORY_PANEL_LABELS.HISTORY_INFO}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">
                            {historyData.recordCount}
                          </span>{" "}
                          {HISTORY_PANEL_LABELS.RECORDS}
                        </div>
                        <div className="text-gray-600">
                          {HISTORY_PANEL_LABELS.DURATION}{" "}
                          <span className="font-medium">
                            {formatDurationMilliseconds(historyData.duration)}{" "}
                            giây
                          </span>
                        </div>
                        <div className="text-gray-600">
                          Quãng đường:{" "}
                          <span className="font-medium">
                            {formatDistance(historyData.distance)} km
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {SIMULATION_PANEL_LABELS.SPEED_LABEL}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={historyPlaybackDuration}
                          onChange={(e) =>
                            onHistoryPlaybackDurationChange?.(
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={simPlaying}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onHistoryPlayClick?.(historyData)}
                        disabled={simPlaying}
                        className={[
                          "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors",
                          simPlaying
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700",
                        ].join(" ")}
                      >
                        {simPlaying
                          ? HISTORY_PANEL_LABELS.PLAYING
                          : HISTORY_PANEL_LABELS.PLAY_BUTTON}
                      </button>
                    </>
                  ) : historyDevice ? (
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-sm text-gray-500">
                        {HISTORY_PANEL_LABELS.NO_HISTORY}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
