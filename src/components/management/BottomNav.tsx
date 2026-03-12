"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard/orders", icon: "📋", label: "Đơn hàng" },
  { href: "/dashboard/tables", icon: "🪑", label: "Bàn ăn" },
  { href: "/dashboard/billing", icon: "💳", label: "Thanh toán" },
  { href: "/settings",         icon: "⚙️", label: "Cài đặt" },
];

export default function ManagementBottomNav() {
  const pathname = usePathname();

  // Hide on login page
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex safe-area-inset-bottom">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href) ||
          (item.href === "/dashboard/orders" && pathname === "/dashboard");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] text-xs font-medium transition-colors ${
              active ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl leading-none mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
