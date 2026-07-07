/**
 * hooks/useApiCall.js
 * --------------------
 * Generic hook for managing async API call state.
 *
 * Handles: loading, data, error state for any async function.
 *
 * Usage:
 *   const { execute, data, isLoading, error } = useApiCall(complaintService.getComplaints);
 *   useEffect(() => { execute({ page: 1 }); }, []);
 */

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useApiCall(apiFunction, { showErrorToast = true } = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "Something went wrong.";
        setError(message);
        if (showErrorToast) {
          toast.error(message);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, showErrorToast]
  );

  return { execute, data, isLoading, error };
}
