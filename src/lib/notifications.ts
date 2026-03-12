import { Order } from "./types";
import { store } from "./store";

function formatOrderMessageVi(order: Order): string {
  const itemsList = order.items
    .map((item) => `• ${item.name} x${item.quantity} - ${item.price.toLocaleString("vi-VN")}đ`)
    .join("\n");

  const paymentLabel =
    order.payment_method === "bank_transfer" ? "Chuyển khoản" : "Tiền mặt";

  return (
    `Xin chào ${order.customer_name}!\n` +
    `Đơn hàng của bạn đã được nhận.\n\n` +
    `Chi tiết:\n${itemsList}\n\n` +
    `Tổng: ${order.total_price.toLocaleString("vi-VN")}đ\n` +
    `Thời gian sẵn sàng: ${order.estimated_ready_time}\n` +
    `Thanh toán: ${paymentLabel}`
  );
}

function formatStaffNotification(order: Order): {
  title: string;
  body: string;
} {
  const itemsSummary = order.items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");

  return {
    title: `Đơn mới! ${order.customer_name}`,
    body: `${itemsSummary} - ${order.total_price.toLocaleString("vi-VN")}đ (${order.payment_method === "bank_transfer" ? "CK" : "Tiền mặt"})`,
  };
}

// ─── WhatsApp Business Platform ───
// Sends order confirmation to customer via WhatsApp
// Free tier: 1,000 service conversations/month
export async function sendWhatsAppNotification(order: Order): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || token === "your-whatsapp-token") {
    console.log("[WhatsApp] Skipped - no token configured");
    console.log("[WhatsApp] Message would be:", formatOrderMessageVi(order));
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: order.customer_phone,
          type: "text",
          text: { body: formatOrderMessageVi(order) },
        }),
      }
    );

    const data = await response.json();
    if (data.messages) {
      console.log("[WhatsApp] Message sent to", order.customer_phone);
      return true;
    } else {
      console.log("[WhatsApp] Failed:", data.error?.message || "Unknown error");
      return false;
    }
  } catch (error) {
    console.error("[WhatsApp] Error:", error);
    return false;
  }
}

// ─── Firebase Cloud Messaging (FCM) ───
// Sends push notifications to all registered staff devices
// Free and unlimited
export async function sendFcmNotification(order: Order): Promise<boolean> {
  const serverKey = process.env.FCM_SERVER_KEY;
  const tokens = store.getFcmTokens();

  if (!serverKey || serverKey === "your-fcm-server-key") {
    const notification = formatStaffNotification(order);
    console.log("[FCM] Skipped - no server key configured");
    console.log("[FCM] Would send:", notification.title, "-", notification.body);
    console.log("[FCM] Registered tokens:", tokens.length);
    return false;
  }

  if (tokens.length === 0) {
    console.log("[FCM] No staff devices registered");
    return false;
  }

  const notification = formatStaffNotification(order);

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: "/pho-icon.svg",
          click_action: "/dashboard",
        },
        data: {
          order_id: order.id,
          type: "new_order",
        },
      }),
    });

    const data = await response.json();
    console.log("[FCM] Sent to", data.success, "devices, failed:", data.failure);
    return data.success > 0;
  } catch (error) {
    console.error("[FCM] Error:", error);
    return false;
  }
}

// ─── Main notification handler ───
// Called when a new order is created
// Step 1: FCM push → staff (instant)
// Step 2: WhatsApp → customer (best-effort, fallback = on-screen confirmation)
export async function notifyOrder(order: Order): Promise<{ whatsapp_sent: boolean }> {
  const results = await Promise.allSettled([
    sendFcmNotification(order),
    sendWhatsAppNotification(order),
  ]);

  const fcmResult = results[0].status === "fulfilled" ? results[0].value : false;
  const whatsappResult = results[1].status === "fulfilled" ? results[1].value : false;

  console.log(`[Notifications] FCM: ${fcmResult}, WhatsApp: ${whatsappResult}`);

  if (whatsappResult) {
    store.markWhatsAppSent(order.id);
  }

  return { whatsapp_sent: whatsappResult };
}
