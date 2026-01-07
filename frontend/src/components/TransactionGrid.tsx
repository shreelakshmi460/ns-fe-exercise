import React, { memo } from 'react';
import { useDataGrid } from '../hooks/useDataGrid';

// Types matching your API response
interface Tag {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: number | string;
  type: string;
  category: { id: number; name: string };
  date: string;
  tags: Tag[];
}

const TransactionGrid: React.FC = () => {
  // Use the hook - it owns all the logic
  const { items, total, loading, page, sortBy, sortOrder, setPage, setSort } =
    useDataGrid<Transaction>('/api/v1/transactions/grid', 10);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              {['Date', 'Description', 'Amount', 'Type'].map((label) => (
                <th
                  key={label}
                  onClick={() => setSort(label.toLowerCase())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                >
                  {label} {sortBy === label.toLowerCase() ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
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
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                  Loading transactions...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              items.map((tx) => (
                <tr key={tx.id} className="text-left">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <span>Total: {total}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages || loading}
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
