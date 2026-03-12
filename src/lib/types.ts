// ─── Menu ────────────────────────────────────────────────────────────────────

export type MenuCategory =
  | "pho_bo"
  | "pho_ga"
  | "com_tam"
  | "new_taste"
  | "extras"
  | "drinks";

export interface MenuItem {
  id: string;
  category_id?: string;           // Supabase FK — optional during migration
  category: MenuCategory;         // local convenience field
  name: string;
  description: string;
  price: number;                  // VND, no decimals
  image_url: string;
  is_available: boolean;
  available: boolean;             // alias kept for backward compat
  display_order?: number;
  created_at: string;
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface Table {
  id: string;
  table_number: number;
  label?: string;
  seats: number;
  qr_code_url?: string;
  status: TableStatus;
  is_active: boolean;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export type SessionStatus = "active" | "billing" | "completed";

export interface TableSession {
  id: string;
  table_id: string;
  table_number?: number;          // denormalized for convenience
  started_at: string;
  ended_at?: string;
  guest_count?: number;
  customer_name?: string;
  customer_phone?: string;
  status: SessionStatus;
  notes?: string;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  item_name?: string;             // denormalized
  name: string;                   // alias kept for backward compat
  item_price?: number;            // denormalized
  price: number;                  // alias kept for backward compat
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  table_session_id?: string;
  table_id?: string;
  table_number?: number;          // denormalized for display
  order_number?: number;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total_price: number;
  payment_method: "bank_transfer" | "cash" | "momo";
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_ready_time: string;
  whatsapp_sent: boolean;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export type StaffRole = "owner" | "manager" | "waiter" | "kitchen";

export interface Staff {
  id: string;
  user_id?: string;
  name: string;
  phone?: string;
  email?: string;
  role: StaffRole;
  is_active: boolean;
  pin_code?: string;
  created_at: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type BillStatus = "unpaid" | "paid" | "void";

export interface Bill {
  id: string;
  table_session_id: string;
  bill_number?: number;
  subtotal: number;
  discount: number;
  total: number;
  status: BillStatus;
  generated_by?: string;
  created_at: string;
  paid_at?: string;
}

export interface Payment {
  id: string;
  bill_id: string;
  method: "cash" | "bank_transfer" | "momo";
  amount: number;
  received_by?: string;
  created_at: string;
}

// ─── Shifts ──────────────────────────────────────────────────────────────────

export type ShiftStatus = "scheduled" | "active" | "completed" | "no_show";

export interface Shift {
  id: string;
  staff_id: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  status: ShiftStatus;
  date: string;
  created_at: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface AppConfig {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  currency: string;
  timezone: string;
  operating_hours?: Record<string, { open: string; close: string }>;
  bank_account_info?: {
    bank: string;
    account: string;
    holder: string;
  };
  payment_methods: string[];
  whatsapp_phone?: string;
  logo_url?: string;
  // Feature toggles
  shift_management_enabled: boolean;
  cash_reconciliation_enabled: boolean;
  whatsapp_notifications_enabled: boolean;
  kitchen_display_enabled: boolean;
  multi_round_ordering_enabled: boolean;
  table_transfer_enabled: boolean;
  daily_reports_enabled: boolean;
  bank_transfer_payment_enabled: boolean;
  momo_payment_enabled: boolean;
  discounts_enabled: boolean;
  updated_at: string;
}

// ─── Legacy alias ────────────────────────────────────────────────────────────

export interface Configuration {
  restaurant_name: string;
  restaurant_phone: string;
  estimated_prep_time: number;
  whatsapp_business_phone: string;
  fcm_tokens: string[];
  bank_account_info: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  };
  operating_hours: {
    open: string;
    close: string;
  };
}
