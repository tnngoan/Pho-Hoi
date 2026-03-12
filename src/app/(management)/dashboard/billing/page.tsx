"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Order } from "@/lib/types";
import { printBillReceipt, PaperSize } from "@/lib/print";

interface BillItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface BillSummary {
  items: BillItem[];
  subtotal: number;
  discount: number;
  total: number;
  orders: Order[];
  table_number: number | null;
  session_id: string | null;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  const [allTables, setAllTables] = useState<{ table_number: number; status: string; active_session: { id: string; total: number; order_count: number } | null }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(tableParam ?? "");
  const [bill, setBill] = useState<BillSummary | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [lastBill, setLastBill] = useState<{ bill: typeof bill; paymentMethod: "cash" | "bank_transfer" } | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bill_paper_size") as PaperSize) ?? "thermal";
    }
    return "thermal";
  });

  const savePaperSize = (s: PaperSize) => {
    setPaperSize(s);
    localStorage.setItem("bill_paper_size", s);
  };

  const fetchTables = useCallback(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTables(data.filter((t: { active_session: null | object }) => t.active_session !== null));
      })
      .catch(console.error);
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const generateBill = useCallback(async (tableNum: string) => {
    if (!tableNum) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/table/${tableNum}`);
      const data = await res.json();
      if (!data.orders?.length) {
        setBill(null);
        setLoading(false);
        return;
      }

      const activeOrders: Order[] = data.orders.filter((o: Order) => o.status !== "cancelled");
      const itemMap: Record<string, BillItem> = {};
      activeOrders.forEach((order) => {
        order.items.forEach((item) => {
          const key = item.menu_item_id;
          if (!itemMap[key]) {
            itemMap[key] = { name: item.name, quantity: 0, price: item.price, subtotal: 0 };
          }
          itemMap[key].quantity += item.quantity;
          itemMap[key].subtotal += item.price * item.quantity;
        });
      });

      const items = Object.values(itemMap);
      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
      setBill({
        items,
        subtotal,
        discount,
        total: subtotal - discount,
        orders: activeOrders,
        table_number: data.table?.table_number ?? null,
        session_id: data.session?.id ?? null,
      });
    } catch {
      setBill(null);
    } finally {
      setLoading(false);
    }
  }, [discount]);

  useEffect(() => {
    if (selectedTable) generateBill(selectedTable);
  }, [selectedTable, generateBill]);

  useEffect(() => {
    if (bill) setBill({ ...bill, discount, total: bill.subtotal - discount });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount]);

  const handlePay = async () => {
    if (!bill) return;
    setLastBill({ bill, paymentMethod });
    setPaid(true);
    if (bill.table_number) {
      await fetch(`/api/table/${bill.table_number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end_session" }),
      });
    }
    fetchTables();
    setBill(null);
    setSelectedTable("");
  };

  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Thanh toán thành công!</h2>
          <p className="text-gray-500 mt-2">Bàn đã được giải phóng.</p>
          <div className="flex flex-col gap-2 mt-6">
            {lastBill?.bill && (
              <button
                onClick={() => printBillReceipt({
                  tableNumber: lastBill.bill!.table_number,
                  items: lastBill.bill!.items,
                  subtotal: lastBill.bill!.subtotal,
                  discount: lastBill.bill!.discount,
                  total: lastBill.bill!.total,
                  paymentMethod: lastBill.paymentMethod,
                  orderCount: lastBill.bill!.orders.length,
                }, paperSize)}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-medium active:bg-gray-700"
              >
                🖨 In hóa đơn ({paperSize === "thermal" ? "80mm" : paperSize})
              </button>
            )}
            <button
              onClick={() => { setPaid(false); setLastBill(null); }}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-medium active:bg-orange-600"
            >
              Hóa đơn mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center">
          <span className="font-bold text-gray-900">Thanh toán</span>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Select table */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn bàn</label>
          {allTables.length === 0 ? (
            <p className="text-sm text-gray-400">Không có bàn nào có khách đang hoạt động.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {allTables.map((t) => (
                <button
                  key={t.table_number}
                  onClick={() => setSelectedTable(String(t.table_number))}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    selectedTable === String(t.table_number)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 active:bg-gray-200"
                  }`}
                >
                  Bàn {t.table_number}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        )}

        {bill && !loading && (
          <>
            {/* Bill detail */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">
                Hóa đơn · Bàn {bill.table_number}
              </h2>
              <div className="space-y-1.5">
                {bill.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                    <span className="font-medium">{item.subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-3 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{bill.subtotal.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Giảm giá</span>
                  <input
                    type="number"
                    min={0}
                    max={bill.subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 text-right px-2 py-1 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Tổng cộng</span>
                  <span className="text-orange-600">{bill.total.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Phương thức thanh toán</h2>
              <div className="grid grid-cols-2 gap-2">
                {(["cash", "bank_transfer"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors border-2 ${
                      paymentMethod === method
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-100 bg-gray-50 text-gray-600 active:bg-gray-100"
                    }`}
                  >
                    {method === "cash" ? "💵 Tiền mặt" : "🏦 Chuyển khoản"}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper size picker */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Khổ giấy in</h2>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "thermal", label: "🧾 Nhiệt", sub: "80 mm" },
                  { key: "A6",      label: "📄 A6",    sub: "105×148 mm" },
                  { key: "A7",      label: "📄 A7",    sub: "74×105 mm" },
                ] as { key: PaperSize; label: string; sub: string }[]).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => savePaperSize(s.key)}
                    className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-colors flex flex-col items-center gap-0.5 ${
                      paperSize === s.key
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-100 bg-gray-50 text-gray-600 active:bg-gray-100"
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="text-gray-400 font-normal">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => printBillReceipt({
                  tableNumber: bill.table_number,
                  items: bill.items,
                  subtotal: bill.subtotal,
                  discount: bill.discount,
                  total: bill.total,
                  paymentMethod,
                  orderCount: bill.orders.length,
                }, paperSize)}
                className="w-12 h-14 rounded-xl border border-gray-200 flex items-center justify-center text-xl active:bg-gray-100 flex-shrink-0"
                title="In hóa đơn trước khi thanh toán"
              >
                🖨
              </button>
              <button
                onClick={handlePay}
                className="flex-1 py-4 rounded-xl bg-green-500 text-white font-bold text-base active:bg-green-600 transition-colors shadow-sm"
              >
                ✓ Xác nhận · {bill.total.toLocaleString("vi-VN")}đ
              </button>
            </div>
          </>
        )}

        {selectedTable && !bill && !loading && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
            <p>Không có đơn hàng nào cho bàn này.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>}>
      <BillingContent />
    </Suspense>
  );
}
