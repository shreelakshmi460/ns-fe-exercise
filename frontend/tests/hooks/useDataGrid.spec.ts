import { renderHook, waitFor, act } from '@testing-library/react';
import { test, expect, vi, beforeEach } from 'vitest'; // Explicitly import 'test'
import { useDataGrid } from '../../src/hooks/useDataGrid';

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (fetch as vi.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ items: [], total: 0 }),
  });
});

test('should initialize with loading true', () => {
  const { result } = renderHook(() => useDataGrid('/api/grid', 10));
  expect(result.current.loading).toBe(true);
});

test('should update data after fetch', async () => {
  (fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ items: [{ id: 1 }], total: 1 }),
  });

  const { result } = renderHook(() => useDataGrid('/api/grid', 10));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.items).toHaveLength(1);
});
