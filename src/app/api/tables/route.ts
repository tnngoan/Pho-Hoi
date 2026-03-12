import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const tables = store.getTables();
    // Enrich with active session info
    const tablesWithSession = tables.map((table) => {
      const session = store.getSessionByTableId(table.id);
      const sessionOrders = session ? store.getSessionOrders(session.id) : [];
      const sessionTotal = sessionOrders.reduce((sum, o) => sum + o.total_price, 0);
      return {
        ...table,
        active_session: session
          ? { id: session.id, started_at: session.started_at, total: sessionTotal, order_count: sessionOrders.length }
          : null,
      };
    });
    return NextResponse.json(tablesWithSession);
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}
