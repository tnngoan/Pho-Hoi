import type { Metadata } from "next";
import ManagementBottomNav from "@/components/management/BottomNav";

export const metadata: Metadata = {
  title: "Phở Hội — Dashboard",
  description: "Phở Hội restaurant management",
};

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {children}
      <ManagementBottomNav />
    </div>
  );
}
