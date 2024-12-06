import React, { useState } from "react";
import { Trade } from "../types/trading";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Download, Filter } from "lucide-react";

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Trade>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof Trade) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredTrades = trades.filter(
    (trade) =>
      trade.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      trade.type.toLowerCase().includes(filter.toLowerCase()) ||
      trade.price.toString().includes(filter),
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue < bValue ? -direction : direction;
  });

  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const paginatedTrades = sortedTrades.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const exportToCSV = () => {
    const headers = ["TIME", "TYPE", "SYMBOL", "PRICE", "AMOUNT", "TOTAL"];
    const data = filteredTrades.map((trade) => [
      format(new Date(trade.timestamp), "yyyy-MM-dd HH:mm:ss"),
      trade.type,
      trade.symbol,
      trade.price,
      trade.amount,
      trade.price * trade.amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `trades_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter trades..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              {["TIME", "TYPE", "SYMBOL", "PRICE", "AMOUNT", "TOTAL"].map(
                (header) => (
                  <th
                    key={header}
                    onClick={() =>
                      handleSort(header.toLowerCase() as keyof Trade)
                    }
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 ${
                      sortField === header.toLowerCase() ? "bg-gray-200" : ""
                    }`}
                  >
                    {header}
                    {sortField === header.toLowerCase() && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(trade.timestamp), "MMM d, HH:mm:ss")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`flex items-center ${
                      trade.type === "buy" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trade.type === "buy" ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trade.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${trade.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trade.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${(trade.price * trade.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedTrades.length === 0 && (
        <div className="text-center py-8 text-gray-500">No trades found</div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
