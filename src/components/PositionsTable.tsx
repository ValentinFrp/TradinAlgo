import React, { useState } from "react";
import { Position } from "../types/trading";
import { TrendingUp, TrendingDown, Filter, Download } from "lucide-react";
import { format } from "date-fns";

interface PositionsTableProps {
  positions: Position[];
  onClosePosition?: (symbol: string) => void;
}

export function PositionsTable({
  positions,
  onClosePosition,
}: PositionsTableProps) {
  const [sortField, setSortField] = useState<keyof Position>("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");

  const handleSort = (field: keyof Position) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedPositions = positions
    .filter(
      (pos) =>
        pos.symbol.toLowerCase().includes(filter.toLowerCase()) ||
        pos.amount.toString().includes(filter),
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;
      return aValue < bValue ? -direction : direction;
    });

  const exportToCSV = () => {
    const headers = ["SYMBOL", "AMOUNT", "ENTRY PRICE", "CURRENT PRICE", "PNL"];
    const data = filteredAndSortedPositions.map((pos) => [
      pos.symbol,
      pos.amount,
      pos.entryPrice,
      pos.currentPrice,
      pos.pnl,
    ]);

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `positions_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter positions..."
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
              {[
                "SYMBOL",
                "AMOUNT",
                "ENTRY PRICE",
                "CURRENT PRICE",
                "PNL",
                "ACTIONS",
              ].map((header, index) => (
                <th
                  key={header}
                  onClick={() =>
                    handleSort(
                      header.toLowerCase().replace(" ", "") as keyof Position,
                    )
                  }
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 ${
                    sortField === header.toLowerCase().replace(" ", "")
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  {header}
                  {sortField === header.toLowerCase().replace(" ", "") && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedPositions.map((position, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {position.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${position.entryPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${position.currentPrice.toLocaleString()}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm flex items-center ${
                    position.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {position.pnl >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  ${Math.abs(position.pnl).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {onClosePosition && (
                    <button
                      onClick={() => onClosePosition(position.symbol)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedPositions.length === 0 && (
        <div className="text-center py-8 text-gray-500">No positions found</div>
      )}
    </div>
  );
}
