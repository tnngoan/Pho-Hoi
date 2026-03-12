import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { notifyOrder } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const tableNumber = parseInt(number, 10);
    if (isNaN(tableNumber)) {
      return NextResponse.json({ error: "Invalid table number" }, { status: 400 });
    }

    const table = store.getTableByNumber(tableNumber);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const body = await request.json();
    const { customer_name, items, notes } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
    }

    // Auto-start or reuse session
    const session = store.getOrEnsureSession(table.id);

    const order = store.createOrder({
      customer_name: customer_name || "Khách",
      customer_phone: "",
      items,
      payment_method: "cash",
      table_number: tableNumber,
      table_id: table.id,
      table_session_id: session.id,
      notes,
    });

    // Fire-and-forget notifications
    notifyOrder(order).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/table/[number]/order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
