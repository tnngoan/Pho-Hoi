"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Replace with Supabase auth once credentials are configured
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;

      // Temporary: accept any login for development
      if (email && password) {
        router.push("/dashboard");
      } else {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Phở Hội</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập nhân viên</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@phohoi.vn"
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-semibold active:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600">← Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
