"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Table } from "@/lib/types";

export default function TablesSettingsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchTables = useCallback(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTables(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const copyQrUrl = (tableNumber: number) => {
    const url = `${baseUrl}/table/${tableNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`Đã copy URL: ${url}`);
    });
  };

  const printQrCode = (tableNumber: number) => {
    const url = `${baseUrl}/table/${tableNumber}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=300x300`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>QR Bàn ${tableNumber} - Phở Hội</title></head>
        <body style="text-align:center;padding:40px;font-family:sans-serif">
          <h2 style="margin-bottom:8px">Phở Hội</h2>
          <p style="color:#666;margin-bottom:24px">Bàn ${tableNumber}</p>
          <img src="${qrUrl}" style="width:250px;height:250px" />
          <p style="margin-top:16px;font-size:13px;color:#666">${url}</p>
          <script>window.onload=()=>window.print()</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center gap-3">
          <Link href="/settings" className="text-gray-400 text-sm">←</Link>
          <span className="font-bold text-gray-900">Bàn ăn & Mã QR</span>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-700">
          <strong>URL đặt món:</strong> {baseUrl}/table/<em>số_bàn</em>
          <br />
          <span className="text-xs text-blue-500">In QR code và dán lên bàn. Khách quét là đặt được ngay.</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {tables.map((table) => (
              <div key={table.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{table.label ?? `Bàn ${table.table_number}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {baseUrl}/table/{table.table_number} · {table.seats} ghế
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyQrUrl(table.table_number)}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg active:bg-gray-200"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => printQrCode(table.table_number)}
                      className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg active:bg-orange-600"
                    >
                      In QR
                    </button>
                  </div>
                </div>

                {/* QR preview */}
                <div className="mt-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${baseUrl}/table/${table.table_number}`)}&size=80x80`}
                    alt={`QR Bàn ${table.table_number}`}
                    width={60}
                    height={60}
                    className="rounded-lg border border-gray-100"
                  />
                  <div className="text-xs text-gray-400">
                    <p>Quét để mở thực đơn bàn {table.table_number}</p>
                    <p className="mt-0.5">{table.status === "available" ? "✓ Trống" : "• Có khách"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
