import { MenuItem, Order, Table, TableSession, Bill } from "./types";
import { randomUUID } from "crypto";

// ─── Menu Items ───────────────────────────────────────────────────────────────

const menuItems: MenuItem[] = [
  // ═══ PHỞ BÒ (Beef Noodle) ═══
  { id: "pb1", name: "Phở Bò 1 loại", description: "Beef pho with 1 topping choice: Tái, Bò Viên, Nạm, Gầu, Gân, or Lòng Bò", price: 75000, category: "pho_bo", image_url: "/images/unnamed(21).jpg", is_available: true, available: true, display_order: 1, created_at: new Date().toISOString() },
  { id: "pb2", name: "Phở Bò 2 loại", description: "Beef pho with 2 topping choices: Tái, Bò Viên, Nạm, Gầu, Gân, or Lòng Bò", price: 80000, category: "pho_bo", image_url: "/images/unnamed(21).jpg", is_available: true, available: true, display_order: 2, created_at: new Date().toISOString() },
  { id: "pb3", name: "Phở Bò 3 loại", description: "Beef pho with 3 topping choices: Tái, Bò Viên, Nạm, Gầu, Gân, or Lòng Bò", price: 85000, category: "pho_bo", image_url: "/images/unnamed(21).jpg", is_available: true, available: true, display_order: 3, created_at: new Date().toISOString() },
  { id: "pb4", name: "Phở Bắp Bò", description: "Beef pho with shank - tender slow-cooked beef shank", price: 77000, category: "pho_bo", image_url: "/images/unnamed(18).jpg", is_available: true, available: true, display_order: 4, created_at: new Date().toISOString() },
  { id: "pb5", name: "Phở Đuôi Bò", description: "Beef tail pho - rich and flavorful oxtail noodle soup", price: 95000, category: "pho_bo", image_url: "/images/unnamed(18).jpg", is_available: true, available: true, display_order: 5, created_at: new Date().toISOString() },
  { id: "pb6", name: "Phở Bò Đặc Biệt", description: "Special combination beef pho with all toppings", price: 100000, category: "pho_bo", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 6, created_at: new Date().toISOString() },

  // ═══ PHỞ GÀ / MIẾN GÀ (Chicken Noodle) ═══
  { id: "pg1", name: "Phở Gà Xé", description: "Chicken pho with shredded chicken", price: 70000, category: "pho_ga", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 1, created_at: new Date().toISOString() },
  { id: "pg2", name: "Phở Gà Chặt", description: "Chicken pho with chopped chicken pieces", price: 75000, category: "pho_ga", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 2, created_at: new Date().toISOString() },
  { id: "pg3", name: "Phở Cánh Gà", description: "Chicken pho with chicken wings", price: 90000, category: "pho_ga", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 3, created_at: new Date().toISOString() },
  { id: "pg4", name: "Phở Đùi Gà", description: "Chicken pho with chicken thigh", price: 110000, category: "pho_ga", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 4, created_at: new Date().toISOString() },
  { id: "pg5", name: "Phở Lòng Gà + Trứng Non", description: "Chicken innard pho with quail eggs", price: 75000, category: "pho_ga", image_url: "/images/unnamed(23).jpg", is_available: true, available: true, display_order: 5, created_at: new Date().toISOString() },
  { id: "pg6", name: "Phở Gà Xé + Lòng Gà + Trứng Non", description: "Shredded chicken pho with innards and quail eggs", price: 80000, category: "pho_ga", image_url: "/images/unnamed(23).jpg", is_available: true, available: true, display_order: 6, created_at: new Date().toISOString() },
  { id: "pg7", name: "Phở Lòng Gà", description: "Chicken innard noodle soup", price: 75000, category: "pho_ga", image_url: "/images/unnamed(23).jpg", is_available: true, available: true, display_order: 7, created_at: new Date().toISOString() },

  // ═══ CƠM TẤM (Steamed Broken Rice) ═══
  { id: "ct1", name: "Cơm Tấm 1 loại", description: "Broken rice with 1 choice: Sườn, Chả Ghẹ, Ốpla, or Bì", price: 75000, category: "com_tam", image_url: "/images/unnamed(14).jpg", is_available: true, available: true, display_order: 1, created_at: new Date().toISOString() },
  { id: "ct2", name: "Cơm Tấm 2 loại", description: "Broken rice with 2 choices: Sườn, Chả Ghẹ, Ốpla, or Bì", price: 80000, category: "com_tam", image_url: "/images/unnamed(14).jpg", is_available: true, available: true, display_order: 2, created_at: new Date().toISOString() },
  { id: "ct3", name: "Cơm Tấm 3 loại", description: "Broken rice with 3 choices: Sườn, Chả Ghẹ, Ốpla, or Bì", price: 85000, category: "com_tam", image_url: "/images/unnamed(14).jpg", is_available: true, available: true, display_order: 3, created_at: new Date().toISOString() },
  { id: "ct4", name: "Cơm Tấm Thập Cẩm", description: "Combination broken rice with all toppings: Sườn, Chả Ghẹ, Ốpla & Bì", price: 95000, category: "com_tam", image_url: "/images/unnamed(14).jpg", is_available: true, available: true, display_order: 4, created_at: new Date().toISOString() },

  // ═══ NEW TASTE ═══
  { id: "nt1", name: "Bánh Mì Bò Kho", description: "Beef stew with bread - rich aromatic Vietnamese beef stew", price: 80000, category: "new_taste", image_url: "/images/unnamed(25).jpg", is_available: true, available: true, display_order: 1, created_at: new Date().toISOString() },
  { id: "nt2", name: "Hủ Tiếu/Phở/Mì Gói Bò Kho", description: "Beef stew noodle - choose hủ tiếu, phở, or instant noodle", price: 80000, category: "new_taste", image_url: "/images/unnamed(25).jpg", is_available: true, available: true, display_order: 2, created_at: new Date().toISOString() },
  { id: "nt3", name: "Bún Bò Huế", description: "Spicy Hue-style beef noodle soup with lemongrass", price: 80000, category: "new_taste", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 3, created_at: new Date().toISOString() },
  { id: "nt4", name: "Bún Bò Huế Đặc Biệt", description: "Special Hue-style beef noodle soup with extra toppings", price: 95000, category: "new_taste", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 4, created_at: new Date().toISOString() },
  { id: "nt5", name: "Hủ Tiếu Bò Viên", description: "Beef ball noodle soup", price: 75000, category: "new_taste", image_url: "/images/unnamed(13).jpg", is_available: true, available: true, display_order: 5, created_at: new Date().toISOString() },

  // ═══ MÓN GỌI THÊM (Extras) ═══
  { id: "ex1", name: "Chén Trứng", description: "Poached egg", price: 15000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 1, created_at: new Date().toISOString() },
  { id: "ex2", name: "Chén Nước Tiết", description: "Blood soup", price: 30000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 2, created_at: new Date().toISOString() },
  { id: "ex3", name: "Chén Thịt Thêm", description: "Extra beef", price: 50000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 3, created_at: new Date().toISOString() },
  { id: "ex4", name: "Chén 2 Loại Thịt", description: "Extra 2 choices of meat", price: 60000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 4, created_at: new Date().toISOString() },
  { id: "ex5", name: "Đùi Gà Thêm", description: "Extra chicken thigh", price: 95000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 5, created_at: new Date().toISOString() },
  { id: "ex6", name: "Chén Đuôi Thêm", description: "Extra beef tail", price: 80000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 6, created_at: new Date().toISOString() },
  { id: "ex7", name: "Phở Thêm", description: "Extra noodle", price: 30000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 7, created_at: new Date().toISOString() },
  { id: "ex8", name: "Cơm Thêm", description: "Extra rice", price: 20000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 8, created_at: new Date().toISOString() },
  { id: "ex9", name: "Bánh Mì Thêm", description: "Extra bread", price: 5000, category: "extras", image_url: "/images/unnamed(15).jpg", is_available: true, available: true, display_order: 9, created_at: new Date().toISOString() },

  // ═══ ĐỒ UỐNG (Drinks) ═══
  { id: "d1", name: "Trà Đá", description: "Ice tea", price: 3000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 1, created_at: new Date().toISOString() },
  { id: "d2", name: "Cà Phê Sữa Đá", description: "Vietnamese iced coffee with condensed milk", price: 29000, category: "drinks", image_url: "/images/unnamed(29).jpg", is_available: true, available: true, display_order: 2, created_at: new Date().toISOString() },
  { id: "d3", name: "Soda Chanh", description: "Fresh lemon soda", price: 45000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 3, created_at: new Date().toISOString() },
  { id: "d4", name: "Soda Chanh Dây", description: "Passion fruit soda", price: 45000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 4, created_at: new Date().toISOString() },
  { id: "d5", name: "Nước Mơ", description: "Apricot drink", price: 35000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 5, created_at: new Date().toISOString() },
  { id: "d6", name: "Sữa Tươi", description: "Fresh milk", price: 35000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 6, created_at: new Date().toISOString() },
  { id: "d7", name: "Yogurt Đá", description: "Ice yogurt", price: 45000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 7, created_at: new Date().toISOString() },
  { id: "d8", name: "Sinh Tố Bơ", description: "Avocado smoothie", price: 59000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 8, created_at: new Date().toISOString() },
  { id: "d9", name: "Sinh Tố Chuối/Xoài/Sapoche", description: "Banana, Mango, or Sapota smoothie", price: 55000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 9, created_at: new Date().toISOString() },
  { id: "d10", name: "Trà Đào Cam Sả Hạt Chia", description: "Orange lemongrass peach tea with chia seed", price: 55000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 10, created_at: new Date().toISOString() },
  { id: "d11", name: "Trà Vải Hạt Chia", description: "Lychee tea with chia seed", price: 55000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 11, created_at: new Date().toISOString() },
  { id: "d12", name: "Tiger", description: "Tiger beer", price: 25000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 12, created_at: new Date().toISOString() },
  { id: "d13", name: "Heineken", description: "Heineken beer", price: 30000, category: "drinks", image_url: "/images/unnamed(16).jpg", is_available: true, available: true, display_order: 13, created_at: new Date().toISOString() },
];

// ─── Tables ───────────────────────────────────────────────────────────────────

const tables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  table_number: i + 1,
  label: `Bàn ${i + 1}`,
  seats: 4,
  qr_code_url: "",
  status: "available" as const,
  is_active: true,
}));

// ─── Sessions ────────────────────────────────────────────────────────────────

const tableSessions: TableSession[] = [];

// ─── Orders ──────────────────────────────────────────────────────────────────

const orders: Order[] = [];
const fcmTokens: string[] = [];

// ─── Store ───────────────────────────────────────────────────────────────────

export const store = {
  // ── Menu ──────────────────────────────────────────────────────────────────

  getMenuItems(): MenuItem[] {
    const categoryOrder = ["pho_bo", "pho_ga", "com_tam", "new_taste", "extras", "drinks"];
    return [...menuItems]
      .filter((i) => i.is_available)
      .sort((a, b) => {
        const catA = categoryOrder.indexOf(a.category);
        const catB = categoryOrder.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      });
  },

  getAllMenuItems(): MenuItem[] {
    const categoryOrder = ["pho_bo", "pho_ga", "com_tam", "new_taste", "extras", "drinks"];
    return [...menuItems].sort((a, b) => {
      const catA = categoryOrder.indexOf(a.category);
      const catB = categoryOrder.indexOf(b.category);
      if (catA !== catB) return catA - catB;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  },

  updateMenuItemAvailability(id: string, is_available: boolean): MenuItem | undefined {
    const item = menuItems.find((i) => i.id === id);
    if (!item) return undefined;
    item.is_available = is_available;
    item.available = is_available;
    return { ...item };
  },

  // ── Tables ────────────────────────────────────────────────────────────────

  getTables(): Table[] {
    return tables.filter((t) => t.is_active);
  },

  getTableByNumber(tableNumber: number): Table | undefined {
    return tables.find((t) => t.table_number === tableNumber && t.is_active);
  },

  getTableById(id: string): Table | undefined {
    return tables.find((t) => t.id === id);
  },

  updateTableStatus(tableId: string, status: Table["status"]): Table | undefined {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return undefined;
    table.status = status;
    return { ...table };
  },

  // ── Sessions ──────────────────────────────────────────────────────────────

  getActiveSessions(): TableSession[] {
    return tableSessions.filter((s) => s.status !== "completed");
  },

  getSessionByTableId(tableId: string): TableSession | undefined {
    return tableSessions.find(
      (s) => s.table_id === tableId && s.status !== "completed"
    );
  },

  getSessionById(id: string): TableSession | undefined {
    return tableSessions.find((s) => s.id === id);
  },

  startSession(tableId: string, data?: Partial<TableSession>): TableSession {
    // End any existing active session for this table
    tableSessions.forEach((s) => {
      if (s.table_id === tableId && s.status === "active") {
        s.status = "completed";
        s.ended_at = new Date().toISOString();
      }
    });

    const table = this.getTableById(tableId);
    const session: TableSession = {
      id: randomUUID(),
      table_id: tableId,
      table_number: table?.table_number,
      started_at: new Date().toISOString(),
      status: "active",
      ...data,
    };
    tableSessions.push(session);
    this.updateTableStatus(tableId, "occupied");
    return session;
  },

  endSession(sessionId: string): TableSession | undefined {
    const session = tableSessions.find((s) => s.id === sessionId);
    if (!session) return undefined;
    session.status = "completed";
    session.ended_at = new Date().toISOString();
    this.updateTableStatus(session.table_id, "available");
    return { ...session };
  },

  getOrEnsureSession(tableId: string): TableSession {
    const existing = this.getSessionByTableId(tableId);
    if (existing) return existing;
    return this.startSession(tableId);
  },

  // ── Orders ────────────────────────────────────────────────────────────────

  getOrders(status?: string): Order[] {
    let result = [...orders];
    if (status && status !== "all") {
      if (status === "active") {
        result = result.filter((o) => !["served", "cancelled"].includes(o.status));
      } else {
        result = result.filter((o) => o.status === status);
      }
    }
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getSessionOrders(sessionId: string): Order[] {
    return orders
      .filter((o) => o.table_session_id === sessionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getOrder(id: string): Order | undefined {
    return orders.find((o) => o.id === id);
  },

  createOrder(data: {
    customer_name: string;
    customer_phone: string;
    items: Order["items"];
    payment_method: Order["payment_method"];
    table_number?: number;
    table_id?: string;
    table_session_id?: string;
    notes?: string;
  }): Order {
    const now = new Date();
    const readyTime = new Date(now.getTime() + 20 * 60 * 1000);
    const total_price = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Auto-start session if table_id provided but no session
    let table_session_id = data.table_session_id;
    if (data.table_id && !table_session_id) {
      const session = this.getOrEnsureSession(data.table_id);
      table_session_id = session.id;
    }

    const order: Order = {
      id: randomUUID(),
      customer_name: data.customer_name || "Khách",
      customer_phone: data.customer_phone || "",
      items: data.items,
      total_price,
      payment_method: data.payment_method,
      status: "pending",
      notes: data.notes,
      table_number: data.table_number,
      table_id: data.table_id,
      table_session_id,
      order_number: orders.length + 1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      estimated_ready_time: readyTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      whatsapp_sent: false,
    };

    orders.push(order);
    return order;
  },

  updateOrderStatus(id: string, status: Order["status"]): Order | undefined {
    const order = orders.find((o) => o.id === id);
    if (!order) return undefined;
    order.status = status;
    order.updated_at = new Date().toISOString();
    return { ...order };
  },

  markWhatsAppSent(id: string): void {
    const order = orders.find((o) => o.id === id);
    if (order) order.whatsapp_sent = true;
  },

  // ── Billing ───────────────────────────────────────────────────────────────

  generateBill(sessionId: string, discount = 0): Bill | null {
    const sessionOrders = this.getSessionOrders(sessionId);
    const activeOrders = sessionOrders.filter((o) => o.status !== "cancelled");
    if (activeOrders.length === 0) return null;

    const subtotal = activeOrders.reduce((sum, o) => sum + o.total_price, 0);
    const total = subtotal - discount;

    const bill: Bill = {
      id: randomUUID(),
      table_session_id: sessionId,
      subtotal,
      discount,
      total,
      status: "unpaid",
      created_at: new Date().toISOString(),
    };
    return bill;
  },

  // ── FCM ───────────────────────────────────────────────────────────────────

  registerFcmToken(token: string): boolean {
    if (!fcmTokens.includes(token)) {
      fcmTokens.push(token);
      return true;
    }
    return false;
  },

  getFcmTokens(): string[] {
    return [...fcmTokens];
  },

  // ── Stats ─────────────────────────────────────────────────────────────────

  getDailyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(
      (o) => new Date(o.created_at) >= today && o.status !== "cancelled"
    );

    const itemCounts: Record<string, { name: string; count: number }> = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.menu_item_id]) {
          itemCounts[item.menu_item_id] = { name: item.name, count: 0 };
        }
        itemCounts[item.menu_item_id].count += item.quantity;
      });
    });

    return {
      date: today.toISOString().split("T")[0],
      total_orders: todayOrders.length,
      completed_orders: todayOrders.filter((o) => o.status === "served").length,
      pending_orders: todayOrders.filter((o) => o.status === "pending").length,
      total_revenue: todayOrders.reduce((sum, o) => sum + o.total_price, 0),
      top_items: Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  },
};
