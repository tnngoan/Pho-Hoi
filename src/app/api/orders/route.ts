import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { notifyOrder } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const orders = store.getOrders(status);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, items, payment_method } = body;

    if (!customer_name || !customer_phone || !items?.length || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, customer_phone, items, payment_method" },
        { status: 400 }
      );
    }

    if (!["bank_transfer", "cash"].includes(payment_method)) {
      return NextResponse.json(
        { error: "Invalid payment_method. Must be 'bank_transfer' or 'cash'" },
        { status: 400 }
      );
    }

    const order = store.createOrder({
      customer_name,
      customer_phone,
      items,
      payment_method,
    });

    // Fire-and-forget: send FCM to staff + WhatsApp to customer
    notifyOrder(order).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
