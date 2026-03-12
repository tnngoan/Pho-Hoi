import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Phở Hội",
  description: "Đặt món - Phở & Vietnamese cuisine tại Vinhomes Central Park, HCMC",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">{children}</div>
    </CartProvider>
  );
}
