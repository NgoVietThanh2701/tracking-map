export const formatDistance = (meters) => {
  const km = meters / 1000;
  return km.toFixed(km >= 10 ? 1 : 2);
};

export const formatDurationSeconds = (seconds) => {
  return Math.round(seconds / 60);
};

export const formatDurationMilliseconds = (milliseconds) => {
  return Math.round(milliseconds / 1000);
};
