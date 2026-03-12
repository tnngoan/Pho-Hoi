"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const TEST_ACCOUNTS = [
  {
    name: "Ann",
    email: "ngoan.n.tr@gmail.com",
    role: "Owner",
    roleVi: "Chủ quán",
    color: "bg-purple-100 text-purple-700",
    access: "Full access — settings, staff, QR, billing",
    href: "/login",
  },
  {
    name: "Minh",
    email: "minh@phohoi.vn",
    role: "Waiter",
    roleVi: "Phục vụ",
    color: "bg-green-100 text-green-700",
    access: "Orders, tables, billing",
    href: "/login",
  },
  {
    name: "Tuấn",
    email: "tuan@phohoi.vn",
    role: "Kitchen",
    roleVi: "Bếp",
    color: "bg-orange-100 text-orange-700",
    access: "Orders view only",
    href: "/login",
  },
  {
    name: "Customer",
    email: "(no login needed)",
    role: "Customer",
    roleVi: "Khách",
    color: "bg-blue-100 text-blue-700",
    access: "Scan QR or open /table/1 directly",
    href: "/table/1",
  },
];

export default function LandingPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Help button — fixed top-right corner */}
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed top-4 right-4 z-40 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold hover:bg-gray-50 active:bg-gray-100"
        aria-label="Test accounts"
      >
        ?
      </button>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden min-h-64">
        <div className="absolute inset-0">
          <Image
            src="/images/unnamed.jpg"
            alt="Phở Hội"
            fill
            className="object-cover opacity-25"
            priority
          />
        </div>
        <div className="relative max-w-lg mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold drop-shadow">Phở Hội</h1>
          <p className="text-orange-100 mt-2 text-lg">Vinhomes Central Park, HCMC</p>
          <p className="text-orange-200 text-sm mt-1">07:00 – 22:00 hàng ngày</p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-lg mx-auto px-6 py-10 space-y-4">

        {/* QR ordering — primary CTA */}
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6">
          <div className="text-3xl mb-2">📱</div>
          <h2 className="text-lg font-bold text-gray-900">Đặt món tại bàn</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quét mã QR trên bàn của bạn để xem thực đơn và đặt món ngay.
          </p>
        </div>

        {/* Browse menu */}
        <Link
          href="/menu"
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-semibold text-gray-900">Xem thực đơn</div>
            <div className="text-sm text-gray-500 mt-0.5">Browse menu (không đặt món)</div>
          </div>
          <span className="text-2xl">🍜</span>
        </Link>

        {/* Staff login */}
        <Link
          href="/login"
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-semibold text-gray-900">Đăng nhập nhân viên</div>
            <div className="text-sm text-gray-500 mt-0.5">Dashboard & quản lý</div>
          </div>
          <span className="text-2xl">👨‍💼</span>
        </Link>
      </div>

      {/* Help modal — test accounts */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setHelpOpen(false)} />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 z-50">
            {/* Handle (mobile) */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Test Accounts</h2>
              <button onClick={() => setHelpOpen(false)} className="text-gray-400 text-xl leading-none">✕</button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Password for all staff accounts: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">test1234</span>
            </p>

            <div className="space-y-2">
              {TEST_ACCOUNTS.map((acc) => (
                <div key={acc.email} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{acc.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${acc.color}`}>
                        {acc.roleVi}
                      </span>
                    </div>
                    {acc.email !== "(no login needed)" ? (
                      <button
                        onClick={() => copyEmail(acc.email)}
                        className="text-xs text-gray-500 font-mono hover:text-orange-600 text-left"
                      >
                        {copied === acc.email ? "✓ Copied!" : acc.email}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">{acc.email}</span>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{acc.access}</p>
                  </div>
                  <Link
                    href={acc.href}
                    onClick={() => setHelpOpen(false)}
                    className="flex-shrink-0 text-xs bg-orange-500 text-white px-2.5 py-1.5 rounded-lg active:bg-orange-600 font-medium"
                  >
                    Go →
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Tap an email to copy it to clipboard
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
