import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async loader whenever `deps` change.
 * Returns { data, loading, error, reload }.
 * Pass `enabled = false` to skip loading (e.g. until a business is selected).
 */
export default function useFetch(loader, deps = [], enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const counter = useRef(0);

  const run = useCallback(async () => {
    const id = ++counter.current;
    setLoading(true);
    setError('');
    try {
      const result = await loaderRef.current();
      if (id === counter.current) setData(result);
    } catch (err) {
      if (id === counter.current) setError(err.message || 'Failed to load data.');
    } finally {
      if (id === counter.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    run();
    return () => {
      counter.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { data, loading, error, reload: run };
}
