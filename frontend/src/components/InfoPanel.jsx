import { useMemo, useState } from "react";
import AutoComplete from "./AutoComplete";
import DeviceForm from "./DeviceForm";
import DeviceList from "./DeviceList";
import {
  TABS,
  PANEL_TITLES,
  SEARCH_PANEL_LABELS,
  ROUTE_PANEL_LABELS,
} from "../constants";

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full h-11 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
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
  onDeselectDevice,
}) {
  const [activeTab, setActiveTab] = useState("devices");
  const [routeReset, setRouteReset] = useState(0);

  const header = useMemo(() => {
    switch (activeTab) {
      case "devices":
        return PANEL_TITLES.DEVICES;
      case "search":
        return PANEL_TITLES.SEARCH;
      case "route":
        return PANEL_TITLES.ROUTE;
      default:
        return PANEL_TITLES.SEARCH;
    }
  }, [activeTab]);

  return (
    <div className="absolute left-0 top-0 z-1000 w-[460px] max-w-[96vw]">
      <div className="max-h-[92vh] bg-white/95 backdrop-blur shadow-lg border-r border-b border-gray-200/80 overflow-hidden flex">
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
                <div className="flex-shrink-0 px-4">
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
                    <span className="text-gray-900">{searchPlace.name}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeTab === "route" ? (
              <div className="space-y-3">
                <AutoComplete
                  key={`route-from-${routeReset}`}
                  label={ROUTE_PANEL_LABELS.FROM_LABEL}
                  placeholder={ROUTE_PANEL_LABELS.FROM_PLACEHOLDER}
                  onSelect={(place) => onRouteFromSelect?.(place)}
                  onClear={() => onRouteFromSelect?.(null)}
                />

                <AutoComplete
                  key={`route-to-${routeReset}`}
                  label="Điểm B"
                  placeholder="Nhập vị trí đến…"
                  onSelect={(place) => onRouteToSelect?.(place)}
                  onClear={() => onRouteToSelect?.(null)}
                />

                <button
                  type="button"
                  onClick={onRouteBuild}
                  disabled={!routeFrom || !routeTo || routeLoading}
                  className={[
                    "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors",
                    !routeFrom || !routeTo || routeLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800",
                  ].join(" ")}
                >
                  {routeLoading ? "Đang tìm đường…" : "Tìm đường"}
                </button>

                <div className="rounded-lg border border-gray-200 p-3 text-sm">
                  {routeError ? (
                    <p className="text-red-600">{routeError}</p>
                  ) : routeResult ? (
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        Tuyến đường
                      </div>
                      <div className="text-gray-600">
                        Quãng đường:{" "}
                        <span className="font-medium">
                          {(routeResult.distance / 1000).toFixed(
                            routeResult.distance >= 10000 ? 1 : 2,
                          )}{" "}
                          km
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Thời gian:{" "}
                        <span className="font-medium">
                          {Math.round(routeResult.duration / 60)} phút
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Chọn A và B, sau đó nhấn “Tìm đường”.
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
                  Xóa tuyến
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
