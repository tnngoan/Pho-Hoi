import { redirect } from "next/navigation";

// Dashboard hub redirects to orders — bottom nav handles navigation between sections
export default function DashboardPage() {
  redirect("/dashboard/orders");
}
