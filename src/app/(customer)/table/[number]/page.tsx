"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MenuItem, CartItem, Order } from "@/lib/types";
import { printOrderReceipt, PrintItem } from "@/lib/print";

const CATEGORIES = [
  { key: "all",       label: "Tất cả" },
  { key: "pho_bo",    label: "Phở Bò" },
  { key: "pho_ga",    label: "Phở Gà" },
  { key: "com_tam",   label: "Cơm Tấm" },
  { key: "new_taste", label: "New Taste" },
  { key: "extras",    label: "Gọi Thêm" },
  { key: "drinks",    label: "Đồ Uống" },
];

export default function TableOrderPage() {
  const params = useParams();
  const tableNumber = params.number as string;

  const [items, setItems]             = useState<MenuItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState("all");
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [toast, setToast]             = useState<string | null>(null);
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes]   = useState("");
  const [lastOrder, setLastOrder]     = useState<{ id: string; items: PrintItem[]; notes?: string; name: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchSessionOrders = useCallback(() => {
    fetch(`/api/table/${tableNumber}`)
      .then((r) => r.json())
      .then((data) => { if (data?.orders) setSessionOrders(data.orders); })
      .catch(() => {});
  }, [tableNumber]);

  useEffect(() => { fetchSessionOrders(); }, [fetchSessionOrders]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Cart ────────────────────────────────────────────────────────────────

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.menu_item_id === item.id);
      if (ex) return prev.map((c) => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((p) => p.filter((c) => c.menu_item_id !== id));
    else setCart((p) => p.map((c) => c.menu_item_id === id ? { ...c, quantity: qty } : c));
  };

  const qty = (id: string) => cart.find((c) => c.menu_item_id === id)?.quantity ?? 0;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  // ── Submit ───────────────────────────────────────────────────────────────

  const submitOrder = async () => {
    if (!cart.length) return;
    setSubmitting(true);
    // Snapshot before clearing
    const snapshot = cart.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price }));
    const name = customerName.trim() || "Khách";
    const notes = orderNotes.trim() || undefined;
    try {
      const res = await fetch(`/api/table/${tableNumber}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: name, items: cart, notes }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      setLastOrder({ id: order.id ?? "new", items: snapshot, notes, name });
      setCart([]);
      setCustomerName("");
      setOrderNotes("");
      setCartOpen(false);
      showToast("Đã gửi đơn! Nhân viên sẽ chuẩn bị ngay.");
      fetchSessionOrders();
    } catch {
      showToast("Gửi đơn thất bại — vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ── Brand bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <p className="font-bold text-base leading-tight">Phở Hội</p>
          <p className="text-orange-100 text-xs">Bàn {tableNumber}</p>
        </div>
        {sessionOrders.length > 0 && (
          <button
            onClick={() => document.getElementById("session-orders")?.scrollIntoView({ behavior: "smooth" })}
            className="text-xs bg-white/20 px-2.5 py-1 rounded-full"
          >
            {sessionOrders.length} đơn đã đặt ↓
          </button>
        )}
      </header>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-14 left-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg text-center animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* ── Print receipt prompt (shown after order, dismissed on tap) ── */}
      {lastOrder && !toast && (
        <div className="fixed top-14 left-4 right-4 z-50 flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="text-green-600 text-lg">✓</span>
          <span className="flex-1 text-sm text-gray-700">Đơn đã gửi</span>
          <button
            onClick={() => {
              printOrderReceipt({
                id: lastOrder.id,
                tableNumber,
                items: lastOrder.items,
                notes: lastOrder.notes,
                customerName: lastOrder.name,
              });
            }}
            className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg active:bg-gray-700 whitespace-nowrap"
          >
            🖨 In biên lai
          </button>
          <button onClick={() => setLastOrder(null)} className="text-gray-400 text-lg leading-none">✕</button>
        </div>
      )}

      {/* ── Category tabs ──────────────────────────────────────────────── */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-gray-100">
        <div className="flex overflow-x-auto gap-1 px-3 py-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                activeCategory === cat.key
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu list ──────────────────────────────────────────────────── */}
      <main className="px-3 py-3 pb-32 space-y-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.map((item) => {
          const q = qty(item.id);
          return (
            <div
              key={item.id}
              className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-orange-600 text-sm">
                    {item.price.toLocaleString("vi-VN")}đ
                  </span>

                  {!item.is_available ? (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Hết món</span>
                  ) : q === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-light shadow-sm active:bg-orange-600"
                    >
                      +
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.id, q - 1)}
                        className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 flex items-center justify-center text-lg font-light active:bg-orange-50"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-bold text-orange-600 text-sm">{q}</span>
                      <button
                        onClick={() => setQty(item.id, q + 1)}
                        className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-light active:bg-orange-600"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous session orders */}
        {sessionOrders.length > 0 && (
          <div id="session-orders" className="mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">
              Đơn đã đặt tại bàn {tableNumber}
            </p>
            <div className="space-y-2">
              {sessionOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="space-y-0.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{item.name} ×{item.quantity}</span>
                        <span className="text-gray-400">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Cart FAB ───────────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between bg-gray-900 text-white rounded-2xl px-5 py-4 shadow-xl active:bg-gray-800"
          >
            <span className="bg-orange-500 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              {cartCount}
            </span>
            <span className="font-semibold text-sm">Xem giỏ hàng</span>
            <span className="font-bold">{cartTotal.toLocaleString("vi-VN")}đ</span>
          </button>
        </div>
      )}

      {/* ── Cart bottom sheet ──────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-bold text-lg text-gray-900">Giỏ hàng</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 text-2xl leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 space-y-2 pb-2">
              {cart.map((item) => (
                <div key={item.menu_item_id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setQty(item.menu_item_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center active:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.menu_item_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center active:bg-orange-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pt-3 pb-2 border-t border-gray-100 space-y-3">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tên (không bắt buộc)"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:bg-gray-200 transition-colors"
              />
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ghi chú: ít cay, không hành..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:bg-gray-200 transition-colors resize-none"
              />
            </div>

            <div className="px-4 pb-8 pt-2">
              <div className="flex justify-between text-sm font-bold text-gray-900 mb-3 px-1">
                <span>Tổng cộng</span>
                <span className="text-orange-600">{cartTotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-base active:bg-orange-600 disabled:opacity-50 transition-colors shadow-md"
              >
                {submitting ? "Đang gửi..." : "Đặt món ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { label: string; cls: string }> = {
    pending:   { label: "Chờ xử lý",   cls: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Xác nhận",    cls: "bg-blue-100 text-blue-700" },
    preparing: { label: "Đang làm",    cls: "bg-blue-100 text-blue-700" },
    ready:     { label: "Sẵn sàng",    cls: "bg-green-100 text-green-700" },
    served:    { label: "Đã phục vụ",  cls: "bg-gray-100 text-gray-500" },
    cancelled: { label: "Đã hủy",      cls: "bg-red-100 text-red-400" },
  };
  const c = MAP[status] ?? MAP.pending;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>
  );
}
