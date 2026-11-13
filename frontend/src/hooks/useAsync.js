import { useCallback, useEffect, useState } from 'react';

// Runs `fn` on mount and whenever `deps` change. Keeps the previous data while reloading.
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ data: s.data, loading: false, error: err.message }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
