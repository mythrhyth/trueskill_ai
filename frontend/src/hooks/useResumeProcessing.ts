/**
 * Hook for managing resume processing workflow.
 * Handles file upload, API calls, loading/error states, and result caching.
 */

import { useState, useCallback } from 'react';
import { apiClient, FullProcessResponse, ApiError } from '../api/client';

interface ProcessingState {
  isLoading: boolean;
  error: ApiError | null;
  result: FullProcessResponse | null;
  uploadedFileName: string | null;
}

export function useResumeProcessing() {
  const [state, setState] = useState<ProcessingState>({
    isLoading: false,
    error: null,
    result: null,
    uploadedFileName: null,
  });

  const processResume = useCallback(
    async (file: File, userId?: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await apiClient.processResume(file, userId);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          result,
          uploadedFileName: file.name,
          error: null,
        }));

        return result;
      } catch (error) {
        const apiError = error as ApiError;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: apiError,
        }));
        throw error;
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
      uploadedFileName: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    processResume,
    clearResult,
    clearError,
  };
}
