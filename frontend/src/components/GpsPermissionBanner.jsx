export default function GpsPermissionBanner({ permission, onRequest }) {
  if (permission !== 'denied') return null;

  return (
    <div className="absolute left-4 right-4 bottom-4 z-1001 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-amber-500 text-amber-950 px-4 py-3 rounded-xl shadow-lg border border-amber-400/80 max-w-md flex items-center gap-3">
        <span className="text-2xl" aria-hidden>📍</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium">Cần quyền truy cập vị trí</p>
          <p className="text-sm opacity-90 mt-0.5">
            Nhấn &quot;Chấp nhận&quot; trên website để bật GPS và hiển thị vị trí của bạn trên bản đồ.
          </p>
        </div>
        <button
          type="button"
          onClick={onRequest}
          className="shrink-0 px-3 py-2 bg-amber-950 text-amber-100 rounded-lg font-medium text-sm hover:bg-amber-900 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
