export default function ResultCard({ error, data, emptyMessage, children }) {
  // Only render if there's no error and data exists
  if (!data && !error) {
    return (
      <div className="p-3 text-center text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
      {children}
    </div>
  );
}
