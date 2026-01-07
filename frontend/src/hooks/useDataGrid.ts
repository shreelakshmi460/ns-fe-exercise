import { useState, useEffect, useCallback, useMemo } from 'react';

export function useDataGrid<T>(endpoint: string, pageSize = 10) {
  const [state, setState] = useState({
    items: [] as T[],
    total: 0,
    loading: true,
    page: 1,
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: state.page.toString(),
        size: pageSize.toString(),
        sort_by: state.sortBy,
        sort_order: state.sortOrder,
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}?${params}`);
      const result = await response.json();

      setState((prev) => ({
        ...prev,
        items: result.items,
        total: result.total,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [endpoint, state.page, state.sortBy, state.sortOrder, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- THE MISSING PART: MEMOIZE THE RETURN ---
  // This prevents the Grid from thinking "everything changed"
  // just because the hook re-ran.
  return useMemo(
    () => ({
      ...state,
      setPage: (newPage: number) => setState((p) => ({ ...p, page: newPage, loading: true })),
      setSort: (column: string) =>
        setState((p) => ({
          ...p,
          sortBy: column,
          sortOrder: p.sortBy === column && p.sortOrder === 'asc' ? 'desc' : 'asc',
          page: 1,
          loading: true,
        })),
    }),
    [state]
  );
}
