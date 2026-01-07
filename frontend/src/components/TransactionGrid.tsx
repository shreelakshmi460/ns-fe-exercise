import React, { useEffect, useState, memo, useCallback } from 'react';

interface Tag {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: string;
  category: {
    id: number;
    name: string;
  };
  date: string;
  user_id: number;
  tags: Tag[];
}

const TransactionGrid: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 10;

  const fetchGridData = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      // ALIGNED WITH API: sort_by and sort_order
      const query = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const response = await fetch(`${backendUrl}/api/v1/transactions/grid?${query}`, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch grid');

      const data = await response.json();
      setTransactions(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  const handleSort = (column: string) => {
    const allowed = ['date', 'amount', 'description', 'type'];
    if (!allowed.includes(column)) return;
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  if (loading) {
    return <div className="text-gray-700">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Date', 'Description', 'Amount', 'Type'].map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col.toLowerCase())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                >
                  {col} {sortBy === col.toLowerCase() ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-left">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium">{tx.description}</td>
                <td className="px-6 py-4 text-sm font-bold">${Number(tx.amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">{tx.type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{tx.category.name}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {tx.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <span>Total: {total}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * pageSize >= total}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(TransactionGrid);
