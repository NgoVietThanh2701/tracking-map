/**
 * Utility function to clean up Leaflet map layers
 */
export function cleanupMapLayers(map, ...refs) {
  refs.forEach((ref) => {
    if (ref.current) {
      map.removeLayer(ref.current);
      ref.current = null;
    }
  });
}
