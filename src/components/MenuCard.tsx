"use client";

import { MenuItem } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function MenuCard({ item, readOnly = false }: { item: MenuItem; readOnly?: boolean }) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-44 relative bg-gray-100">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1 flex-1 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-orange-600">
            {item.price === 0
              ? "Miễn phí"
              : `${item.price.toLocaleString("vi-VN")}đ`}
          </span>
          {!readOnly && (
            <button
              onClick={() => addItem(item)}
              disabled={!item.available}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.available
                  ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {item.available ? "Thêm" : "Hết"}
            </button>
          )}
          {readOnly && !item.available && (
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-400">Hết</span>
          )}
        </div>
      </div>
    </div>
  );
}
