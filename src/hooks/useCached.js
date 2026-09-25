import { useCallback, useEffect, useRef, useState } from "react";

// Data already loaded in this browser tab, shown instantly on the next visit
// while a fresh copy loads in the background. Cleared on sign-in, sign-out and
// whenever results change.
const store = new Map();
export const clearCache = () => store.clear();

/** keepPrevious: while a new key loads, keep showing the last data instead of nothing. */
export default function useCached(key, fetcher, { keepPrevious = false } = {}) {
  const fetcherRef = useRef(fetcher);
  const keepRef = useRef(keepPrevious);
  useEffect(() => { fetcherRef.current = fetcher; });
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let active = true;
    fetcherRef.current()
      .then((data) => {
        store.set(key, data);
        if (active) setState({ key, data, error: null });
      })
      .catch((error) => active && setState((s) => ({ key, data: keepRef.current ? s.data : null, error })));
    return () => { active = false; };
  }, [key]);

  const reload = useCallback(async () => {
    const data = await fetcherRef.current();
    store.set(key, data);
    setState({ key, data, error: null });
    return data;
  }, [key]);

  const fresh = state.key === key ? state : null;
  return {
    data: fresh?.data ?? store.get(key) ?? (keepPrevious ? state.data : null),
    error: fresh?.error && !store.get(key) ? fresh.error : null,
    reload,
  };
}

// One shared copy of a programme's results for Results, GPA, Planner and Standing
export const resultsKey = (enrollmentId) => `results:${enrollmentId || "current"}`;
