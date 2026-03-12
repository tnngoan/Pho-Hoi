"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } =
    useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col z-50">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Giỏ hàng ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-orange-600">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.menu_item_id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.menu_item_id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.menu_item_id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-orange-600">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
                >
                  Xóa tất cả
                </button>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg bg-orange-500 text-white font-medium text-center hover:bg-orange-600"
                >
                  Đặt hàng
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
