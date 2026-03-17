/**
 * Consistent API error handling utility
 */
export const handleApiError = (error, defaultMessage) => {
  const errorMessage =
    error?.response?.data?.error ||
    error?.message ||
    defaultMessage ||
    "An error occurred";

  throw new Error(errorMessage);
};
