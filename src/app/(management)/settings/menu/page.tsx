"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MenuItem } from "@/lib/types";

const CATEGORIES = [
  { key: "pho_bo",    label: "Phở Bò" },
  { key: "pho_ga",    label: "Phở Gà" },
  { key: "com_tam",   label: "Cơm Tấm" },
  { key: "new_taste", label: "New Taste" },
  { key: "extras",    label: "Gọi Thêm" },
  { key: "drinks",    label: "Đồ Uống" },
];

export default function MenuSettingsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchItems = useCallback(() => {
    fetch("/api/menu?all=1")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleAvailability = async (item: MenuItem) => {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !item.is_available }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, is_available: !i.is_available, available: !i.is_available } : i)
      );
    }
  };

  const filtered = activeCategory === "all"
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-gray-400 text-sm">←</Link>
            <span className="font-bold text-gray-900">Quản lý thực đơn</span>
          </div>
        </div>
      </header>

      {/* Category filter */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCategory === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Tất cả
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === cat.key ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 bg-white rounded-xl border p-3 ${
                  !item.is_available ? "opacity-60 border-gray-100" : "border-gray-100"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${item.is_available ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.price.toLocaleString("vi-VN")}đ</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  }`}>
                    {item.is_available ? "Còn" : "Hết"}
                  </span>
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      item.is_available ? "bg-green-400" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                      item.is_available ? "translate-x-5" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
