"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

interface TableInfo {
  id: string;
  table_number: number;
  label?: string;
  seats: number;
  status: TableStatus;
  is_active: boolean;
  active_session: {
    id: string;
    started_at: string;
    total: number;
    order_count: number;
  } | null;
}

const STATUS_CONFIG: Record<TableStatus, { label: string; bg: string; text: string; dot: string }> = {
  available: { label: "Trống",    bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-400" },
  occupied:  { label: "Có khách", bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"  },
  reserved:  { label: "Đã đặt",   bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  cleaning:  { label: "Đang dọn", bg: "bg-gray-50",   text: "text-gray-500",   dot: "bg-gray-400"  },
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  const fetchTables = useCallback(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTables(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 15000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const updateTableStatus = async (tableNumber: number, status: TableStatus | "end_session") => {
    const body = status === "end_session" ? { action: "end_session" } : { status };
    await fetch(`/api/table/${tableNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSelectedTable(null);
    fetchTables();
  };

  const elapsedMinutes = (startedAt: string) => {
    return Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
  };

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const availableCount = tables.filter((t) => t.status === "available").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900">Bàn ăn</span>
          <button onClick={fetchTables} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg">
            Làm mới
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{occupiedCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Có khách</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Trống</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{tables.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tổng số bàn</p>
          </div>
        </div>

        {/* Table grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map((table) => {
              const cfg = STATUS_CONFIG[table.status];
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`rounded-2xl border-2 p-4 text-left active:scale-95 transition-transform ${
                    table.status === "available"
                      ? "border-green-200 bg-green-50"
                      : table.status === "occupied"
                      ? "border-blue-300 bg-blue-50"
                      : table.status === "reserved"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">Bàn {table.table_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{table.seats} ghế</p>
                  {table.active_session && (
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <p className="text-xs font-medium text-blue-700">
                        {elapsedMinutes(table.active_session.started_at)} phút
                      </p>
                      <p className="text-xs text-blue-600">
                        {table.active_session.order_count} đơn · {table.active_session.total.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table detail bottom sheet */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedTable(null)} />
          <div className="relative bg-white rounded-t-3xl p-6 z-50">
            {/* Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />

            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="font-bold text-gray-900 text-lg">
                {selectedTable.label ?? `Bàn ${selectedTable.table_number}`}
              </h2>
              <button onClick={() => setSelectedTable(null)} className="text-gray-400 text-xl leading-none">✕</button>
            </div>

            {selectedTable.active_session ? (
              <div className="mb-4 bg-blue-50 rounded-xl p-3 text-sm">
                <p className="font-medium text-blue-800 mb-1">Phiên đang hoạt động</p>
                <p className="text-blue-600">
                  Thời gian: {elapsedMinutes(selectedTable.active_session.started_at)} phút
                </p>
                <p className="text-blue-600">
                  {selectedTable.active_session.order_count} đơn · Tổng: {selectedTable.active_session.total.toLocaleString("vi-VN")}đ
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Bàn đang {STATUS_CONFIG[selectedTable.status].label.toLowerCase()}</p>
            )}

            <div className="space-y-2">
              {selectedTable.status === "available" && (
                <button
                  onClick={() => updateTableStatus(selectedTable.table_number, "occupied")}
                  className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-medium active:bg-blue-600 transition-colors"
                >
                  Bắt đầu phiên (có khách)
                </button>
              )}
              {selectedTable.active_session && (
                <Link
                  href={`/dashboard/billing?table=${selectedTable.table_number}`}
                  className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-medium active:bg-orange-600 transition-colors flex items-center justify-center"
                  onClick={() => setSelectedTable(null)}
                >
                  Xuất hóa đơn
                </Link>
              )}
              {selectedTable.status === "occupied" && (
                <button
                  onClick={() => updateTableStatus(selectedTable.table_number, "end_session")}
                  className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium active:bg-gray-50 transition-colors"
                >
                  Kết thúc phiên
                </button>
              )}
              {selectedTable.status !== "cleaning" && selectedTable.status !== "occupied" && (
                <button
                  onClick={() => updateTableStatus(selectedTable.table_number, "cleaning")}
                  className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium active:bg-gray-50 transition-colors"
                >
                  Đánh dấu đang dọn
                </button>
              )}
              {selectedTable.status === "cleaning" && (
                <button
                  onClick={() => updateTableStatus(selectedTable.table_number, "available")}
                  className="w-full py-3.5 rounded-xl bg-green-500 text-white font-medium active:bg-green-600 transition-colors"
                >
                  Đã sẵn sàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
