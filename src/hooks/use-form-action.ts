"use client";

import { useState, useCallback, useTransition } from "react";
import { getErrorMessage } from "@/lib/api-error";

interface FormState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
}

interface UseFormActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for handling form submissions with loading and error states
 */
export function useFormAction<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
  options?: UseFormActionOptions<TOutput>
) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<FormState<TOutput>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
  });

  const execute = useCallback(
    async (input: TInput) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
      }));

      startTransition(async () => {
        try {
          const result = await action(input);
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
          });
          options?.onSuccess?.(result);
        } catch (err) {
          const message = getErrorMessage(err);
          setState({
            data: null,
            error: message,
            isLoading: false,
            isSuccess: false,
          });
          options?.onError?.(message);
        }
      });
    },
    [action, options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
    });
  }, []);

  return {
    execute,
    reset,
    isLoading: isPending || state.isLoading,
    isSuccess: state.isSuccess,
    error: state.error,
    data: state.data,
  };
}

/**
 * Hook for API fetch requests with error handling
 */
export function useFetch<T>() {
  const [state, setState] = useState<{
    data: T | null;
    error: string | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const fetchData = useCallback(
    async (url: string, options?: RequestInit) => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setState({ data, error: null, isLoading: false });
        return data as T;
      } catch (err) {
        const message = getErrorMessage(err);
        setState({ data: null, error: message, isLoading: false });
        throw err;
      }
    },
    []
  );

  return {
    ...state,
    fetchData,
    reset: () => setState({ data: null, error: null, isLoading: false }),
  };
}
