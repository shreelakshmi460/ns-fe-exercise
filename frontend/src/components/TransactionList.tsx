import React, { useEffect, useState, useMemo, useRef } from 'react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: string;
  category_rel: {
    id: number;
    name: string;
  };
  date: string;
  user_id: number;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const skip = (page - 1) * pageSize;
        const response = await fetch(
          `${backendUrl}/api/v1/transactions/?skip=${skip}&limit=${pageSize}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'All') return transactions;
    return transactions.filter(
      (t: Transaction) => t.type.toLowerCase() === filterType.toLowerCase()
    );
  }, [transactions, filterType]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLastPage = transactions.length < pageSize;

  if (loading) {
    return <div className="text-gray-700">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
      </div>
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                ref={dropdownRef}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Type</span>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="hover:bg-gray-200 rounded p-1 transition-colors"
                  >
                    <svg
                      className="w-3 h-3 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {isFilterOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 z-10 mt-2 w-32 bg-white border border-gray-200 shadow-lg rounded-md text-left normal-case font-normal">
                    <ul className="py-1 text-sm text-gray-700">
                      {['All', 'Credit', 'Debit'].map((option) => (
                        <li key={option}>
                          <button
                            onClick={() => {
                              setFilterType(option);
                              setIsFilterOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 ${
                              filterType === option ? 'bg-blue-50 font-bold' : ''
                            }`}
                          >
                            {option}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-2 inline-flex justify-center text-center text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'credit'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {transaction.category_rel.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Previous
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
          Page {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={isLastPage}
          className="px-4 py-2 text-sm font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
