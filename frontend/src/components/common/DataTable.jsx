import { useState, useMemo } from "react";
import { useDebounce } from "../../hooks/useDebounce.js";
import { EmptyState } from "./EmptyState.jsx";
import { SkeletonLoader } from "./SkeletonLoader.jsx";

export const DataTable = ({
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKey = "title",
  pagination = true,
  itemsPerPage = 10,
  emptyStateTitle = "No data found",
  emptyStateDesc = "There are no records to display.",
  onRowClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Search Filter
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return data;
    return data.filter((item) => {
      // Allow searching multiple keys if searchKey is array, else single key
      const keys = Array.isArray(searchKey) ? searchKey : [searchKey];
      return keys.some(key => {
        const value = item[key];
        return value && String(value).toLowerCase().includes(debouncedSearch.toLowerCase());
      });
    });
  }, [data, debouncedSearch, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, pagination, itemsPerPage]);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer hover:bg-gray-100 select-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortConfig.key === col.key && (
                      <span className="text-brand-600">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState title={emptyStateTitle} description={emptyStateDesc} />
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of{" "}
            <span className="font-medium">{sortedData.length}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
