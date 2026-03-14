import L from "leaflet";

export function buildStartFlagIcon() {
  return L.divIcon({
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
}

export function buildEndPinIcon() {
  return L.divIcon({
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
  });
}

export function buildDistanceIcon(kmText) {
  return L.divIcon({
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
}

export function createSequenceMarkerIcon(index) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #2563eb;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        ${index}
      </div>
    `,
  });
}
