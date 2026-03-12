import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
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
    </div>
  );
}
