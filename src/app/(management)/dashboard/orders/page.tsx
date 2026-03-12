"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Order } from "@/lib/types";
import { printOrderReceipt } from "@/lib/print";

const STATUS_CONFIG = {
  pending:   { label: "Chờ xử lý",   color: "bg-yellow-100 text-yellow-800", next: "confirmed" as const },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700",    next: "preparing" as const },
  preparing: { label: "Đang làm",    color: "bg-blue-100 text-blue-800",    next: "ready"     as const },
  ready:     { label: "Sẵn sàng",    color: "bg-green-100 text-green-800",  next: "served"    as const },
  served:    { label: "Đã phục vụ",  color: "bg-gray-100 text-gray-600",    next: null },
  cancelled: { label: "Đã hủy",      color: "bg-red-100 text-red-500",      next: null },
};

const NEXT_LABEL: Record<string, string> = {
  pending: "Xác nhận", confirmed: "Bắt đầu làm", preparing: "Sẵn sàng", ready: "Đã phục vụ",
};

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("active");
  const [stats, setStats]     = useState<{ total_orders: number; total_revenue: number; completed_orders: number; pending_orders: number } | null>(null);
  const [notif, setNotif]     = useState("default");
  const prevRef               = useRef(0);

  const requestNotif = useCallback(async () => {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotif(p);
  }, []);

  useEffect(() => { if ("Notification" in window) setNotif(Notification.permission); }, []);

  const fetchOrders = useCallback(() => {
    fetch("/api/orders").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) {
        const pc = data.filter((o: Order) => o.status === "pending").length;
        if (prevRef.current > 0 && pc > prevRef.current && Notification.permission === "granted" && data[0]) {
          new Notification(`Đơn mới! Bàn ${data[0].table_number ?? "?"}`, {
            body: data[0].items.map((i: { name: string; quantity: number }) => `${i.name} ×${i.quantity}`).join(", "),
            icon: "/pho-icon.svg",
          });
        }
        prevRef.current = pc;
        setOrders(data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchStats = useCallback(() => {
    fetch("/api/stats/daily").then((r) => r.json()).then((d) => { if (d && !d.error) setStats(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchOrders(); fetchStats();
    const t = setInterval(() => { fetchOrders(); fetchStats(); }, 10000);
    return () => clearInterval(t);
  }, [fetchOrders, fetchStats]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchOrders(); fetchStats();
  };

  const filtered = filter === "active"
    ? orders.filter((o) => !["served", "cancelled"].includes(o.status))
    : filter === "served" ? orders.filter((o) => o.status === "served")
    : orders;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-900">Đơn hàng</h1>
          <div className="flex items-center gap-2">
            {notif !== "granted" ? (
              <button onClick={requestNotif} className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg">
                🔔 Bật thông báo
              </button>
            ) : (
              <span className="text-xs text-green-600 font-medium">🔔 Bật</span>
            )}
            <button onClick={() => { fetchOrders(); fetchStats(); }} className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg">
              Làm mới
            </button>
          </div>
        </div>
      </header>

      <div className="px-3 py-4 space-y-4">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">Đơn hôm nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">Doanh thu</p>
              <p className="text-xl font-bold text-orange-600 mt-1">{stats.total_revenue.toLocaleString("vi-VN")}đ</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">Đang chờ</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending_orders}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed_orders}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {[{ key: "active", label: "Đang xử lý" }, { key: "served", label: "Đã phục vụ" }, { key: "all", label: "Tất cả" }].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex-1 transition-colors ${
                filter === f.key ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Không có đơn hàng</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
                    order.status === "pending" ? "border-yellow-300" : "border-gray-100"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {order.table_number && (
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            Bàn {order.table_number}
                          </span>
                        )}
                        <span className="font-semibold text-gray-900 text-sm">{order.customer_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="font-bold text-sm text-gray-900">{order.total_price.toLocaleString("vi-VN")}đ</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                          <span className="text-gray-400">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                        </div>
                      ))}
                      {order.notes && <p className="text-xs text-gray-400 italic mt-1">{order.notes}</p>}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => printOrderReceipt({
                          id: order.id,
                          tableNumber: order.table_number ?? "—",
                          items: order.items,
                          notes: order.notes,
                          customerName: order.customer_name,
                        })}
                        className="w-10 h-10 flex-shrink-0 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100"
                        title="In phiếu bếp"
                      >
                        🖨
                      </button>
                      {cfg.next && (
                        <button
                          onClick={() => updateStatus(order.id, cfg.next!)}
                          className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm active:bg-orange-600"
                        >
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
