import Link from "next/link";

const SETTINGS_SECTIONS = [
  { href: "/settings/menu",   icon: "🍜", title: "Thực đơn",     desc: "Thêm/sửa/xóa danh mục và món ăn, bật/tắt tồn kho" },
  { href: "/settings/staff",  icon: "👥", title: "Nhân viên",    desc: "Quản lý tài khoản nhân viên và phân quyền" },
  { href: "/settings/tables", icon: "🪑", title: "Bàn ăn & QR", desc: "Tạo bàn, tạo mã QR, in và dán lên bàn" },
];

const FEATURE_TOGGLES = [
  { label: "Đặt nhiều lần trong phiên", key: "multi_round_ordering_enabled",  default: true  },
  { label: "Quản lý ca làm",            key: "shift_management_enabled",       default: false },
  { label: "Đối soát tiền mặt",         key: "cash_reconciliation_enabled",    default: false },
  { label: "Thông báo WhatsApp",        key: "whatsapp_notifications_enabled", default: false },
  { label: "Màn hình bếp",             key: "kitchen_display_enabled",         default: false },
  { label: "Chuyển bàn",               key: "table_transfer_enabled",          default: false },
  { label: "Báo cáo hàng ngày",        key: "daily_reports_enabled",           default: true  },
  { label: "Thanh toán chuyển khoản",  key: "bank_transfer_payment_enabled",   default: true  },
  { label: "Thanh toán Momo",          key: "momo_payment_enabled",            default: false },
  { label: "Giảm giá hóa đơn",        key: "discounts_enabled",               default: false },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900">Cài đặt</span>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Chỉ Owner</span>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Quick nav */}
        <div className="space-y-2">
          {SETTINGS_SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50"
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
              <span className="text-gray-300">›</span>
            </Link>
          ))}
        </div>

        {/* Restaurant info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin nhà hàng</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tên nhà hàng</label>
              <input
                type="text"
                defaultValue="Phở Hội"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Địa chỉ</label>
              <input
                type="text"
                defaultValue="Vinhomes Central Park, HCMC"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0909-xxx-xxx"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>
            <button className="w-full py-3 bg-orange-500 text-white rounded-lg text-sm font-medium active:bg-orange-600 transition-colors">
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Tính năng</h2>
          <div className="space-y-3">
            {FEATURE_TOGGLES.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{feature.label}</span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    feature.default ? "bg-orange-500" : "bg-gray-200"
                  }`}
                  aria-label={feature.label}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      feature.default ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Cài đặt tính năng sẽ được lưu vào Supabase sau khi kết nối.
          </p>
        </div>
      </div>
    </div>
  );
}
