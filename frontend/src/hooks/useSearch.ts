// ─────────────────────────────────────────────────────────────────────────────
//  hooks/useSearch.ts
//
//  Custom hook that owns all search state.
//
//  WHY a custom hook?
//  If you put all this logic in the component, it becomes unreadable.
//  The hook encapsulates: params, results, loading, error, pagination,
//  debouncing, and real-time polling — the component just calls it.
//
//  Debouncing: wait 400ms after the user stops typing before searching.
//  Without debounce, every keystroke fires a request — 10 chars = 10 requests.
//
//  Real-time polling: re-fetch every 5s when liveMode is on.
//  New logs appear automatically without the user refreshing.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { search }                                    from "../lib/api";
import type { SearchParams, SearchResponse }         from "../types";

const DEBOUNCE_MS   = 400;
const POLL_INTERVAL = 5000;

export function useSearch() {
  const [params, setParams] = useState<SearchParams>({ page: 1, limit: 50 });
  const [result, setResult]     = useState<SearchResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  // Ref to cancel in-flight debounce timer when params change again
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref for polling interval
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Core fetch function ─────────────────────────────────────────────────
  const fetchResults = useCallback(async (p: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await search(p);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced search — fires when params change ─────────────────────────
 useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    fetchResults(params);
  }, DEBOUNCE_MS);

  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, [params, fetchResults]);

  // ── Real-time polling ───────────────────────────────────────────────────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    if (liveMode) {
      pollRef.current = setInterval(() => {
        // Always fetch page 1 when polling — we want the latest logs
        fetchResults({ ...params, page: 1 });
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [liveMode, params, fetchResults]);

  // ── Param updaters ──────────────────────────────────────────────────────
  // Always reset to page 1 when filters change
  const updateParam = useCallback((key: keyof SearchParams, value: string | boolean | number | undefined) => {
    setParams((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback(() => {
    setParams({ page: 1, limit: 50 });
  }, []);
  return {
    params,
    result,
    loading,
    error,
    liveMode,
    setLiveMode,
    updateParam,
    setPage,
    clearFilters,
    refetch: () => fetchResults(params),
  };
}