import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) =>
        setState({ data: null, loading: false, error: err.message || 'An error occurred' })
      );
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useMutation<TInput, TOutput>(
  mutator: (input: TInput) => Promise<TOutput>
) {
  const [state, setState] = useState<UseApiState<TOutput>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (input: TInput) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await mutator(input);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err: any) {
        setState({ data: null, loading: false, error: err.message || 'An error occurred' });
        throw err;
      }
    },
    [mutator]
  );

  return { ...state, mutate };
}
