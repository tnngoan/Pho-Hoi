"use client";

import { useState } from "react";
import Link from "next/link";
import { StaffRole } from "@/lib/types";

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  is_active: boolean;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  owner:   "Chủ quán",
  manager: "Quản lý",
  waiter:  "Phục vụ",
  kitchen: "Bếp",
};

const ROLE_COLORS: Record<StaffRole, string> = {
  owner:   "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  waiter:  "bg-green-100 text-green-700",
  kitchen: "bg-orange-100 text-orange-700",
};

// Demo data — will come from Supabase in production
const DEMO_STAFF: StaffMember[] = [
  { id: "s1", name: "Ann",  email: "ngoan.n.tr@gmail.com", role: "owner",   is_active: true },
  { id: "s2", name: "Minh", email: "minh@phohoi.vn",       role: "waiter",  is_active: true },
  { id: "s3", name: "Tuấn", email: "tuan@phohoi.vn",       role: "kitchen", is_active: true },
];

export default function StaffSettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>(DEMO_STAFF);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("waiter");

  const toggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => s.id === id ? { ...s, is_active: !s.is_active } : s)
    );
  };

  const addStaff = () => {
    if (!newName) return;
    setStaff((prev) => [
      ...prev,
      { id: `s${Date.now()}`, name: newName, email: newEmail, role: newRole, is_active: true },
    ]);
    setNewName("");
    setNewEmail("");
    setNewRole("waiter");
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-gray-400 text-sm">←</Link>
            <span className="font-bold text-gray-900">Quản lý nhân viên</span>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg active:bg-orange-600"
          >
            + Thêm
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {/* Add staff form */}
        {showAdd && (
          <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Nhân viên mới</h3>
            <input
              type="text"
              placeholder="Tên *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as StaffRole)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none bg-white"
            >
              {(Object.keys(ROLE_LABELS) as StaffRole[]).map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={addStaff} className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium active:bg-orange-600">
                Thêm nhân viên
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 active:bg-gray-50">
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Staff list */}
        {staff.map((member) => (
          <div
            key={member.id}
            className={`bg-white rounded-xl border border-gray-100 p-4 ${!member.is_active ? "opacity-60" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                  {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                  {ROLE_LABELS[member.role]}
                </span>
                {member.role !== "owner" && (
                  <button
                    onClick={() => toggleActive(member.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      member.is_active ? "bg-green-400" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                      member.is_active ? "translate-x-5" : "translate-x-1"
                    }`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <p className="text-xs text-center text-gray-400 py-2">
          Kết nối Supabase để lưu và đồng bộ dữ liệu nhân viên.
        </p>
      </div>
    </div>
  );
}
