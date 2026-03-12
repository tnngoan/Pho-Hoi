import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  _request: NextRequest,
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

    const session = store.getSessionByTableId(table.id);
    const orders = session ? store.getSessionOrders(session.id) : [];

    return NextResponse.json({ table, session: session ?? null, orders });
  } catch (error) {
    console.error("GET /api/table/[number] error:", error);
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}

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
    const session = store.startSession(table.id, {
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      guest_count: body.guest_count,
      notes: body.notes,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("POST /api/table/[number] error:", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const tableNumber = parseInt(number, 10);
    const table = store.getTableByNumber(tableNumber);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const body = await request.json();

    if (body.action === "end_session") {
      const session = store.getSessionByTableId(table.id);
      if (session) {
        store.endSession(session.id);
      }
      return NextResponse.json({ ok: true });
    }

    if (body.status) {
      store.updateTableStatus(table.id, body.status);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/table/[number] error:", error);
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}
