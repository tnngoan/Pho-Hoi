"use client";

import { useEffect, useState } from "react";
import { MenuItem } from "@/lib/types";
import Image from "next/image";

const CATEGORIES = [
  { key: "all",       label: "Tất cả" },
  { key: "pho_bo",    label: "Phở Bò" },
  { key: "pho_ga",    label: "Phở Gà" },
  { key: "com_tam",   label: "Cơm Tấm" },
  { key: "new_taste", label: "New Taste" },
  { key: "extras",    label: "Gọi Thêm" },
  { key: "drinks",    label: "Đồ Uống" },
];

export default function BrowseMenuPage() {
  const [items, setItems]             = useState<MenuItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-orange-500 text-white px-4 py-3 shadow-sm">
        <p className="font-bold text-base">Phở Hội — Thực đơn</p>
        <p className="text-orange-100 text-xs mt-0.5">Quét QR trên bàn để đặt món</p>
      </header>

      {/* Category tabs */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-gray-100">
        <div className="flex overflow-x-auto gap-1 px-3 py-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[36px] transition-colors ${
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

      {/* Menu */}
      <main className="px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.map((item) => (
          <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-orange-600 text-sm">{item.price.toLocaleString("vi-VN")}đ</span>
                {!item.is_available && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Hết món</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      <footer className="border-t border-gray-100 bg-white mt-4 px-4 py-5 text-center text-xs text-gray-400">
        <p>Phở Hội · Vinhomes Central Park, HCMC</p>
        <p className="mt-0.5">07:00 – 22:00 hàng ngày</p>
      </footer>
    </div>
  );
}
