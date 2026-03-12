-- ============================================================
-- Phở Hội Restaurant Management System
-- Initial Schema — v3.0 (Single-Restaurant)
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── app_config ───────────────────────────────────────────────────────────────
-- Single row holding all restaurant-wide settings and feature toggles.

CREATE TABLE app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Phở Hội',
  address TEXT,
  phone TEXT,
  currency TEXT DEFAULT 'VND',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  operating_hours JSONB,
  -- e.g. { "mon": { "open": "07:00", "close": "22:00" }, ... }
  bank_account_info JSONB,
  -- e.g. { "bank": "Vietcombank", "account": "1234567890", "holder": "NGUYEN VAN A" }
  payment_methods TEXT[] DEFAULT ARRAY['cash'],
  whatsapp_phone TEXT,
  logo_url TEXT,

  -- Feature toggles
  shift_management_enabled         BOOLEAN DEFAULT false,
  cash_reconciliation_enabled      BOOLEAN DEFAULT false,
  whatsapp_notifications_enabled   BOOLEAN DEFAULT false,
  kitchen_display_enabled          BOOLEAN DEFAULT false,
  multi_round_ordering_enabled     BOOLEAN DEFAULT true,
  table_transfer_enabled           BOOLEAN DEFAULT false,
  daily_reports_enabled            BOOLEAN DEFAULT true,
  bank_transfer_payment_enabled    BOOLEAN DEFAULT true,
  momo_payment_enabled             BOOLEAN DEFAULT false,
  discounts_enabled                BOOLEAN DEFAULT false,

  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default config for Phở Hội
INSERT INTO app_config (
  name, address, phone, currency, timezone,
  operating_hours,
  bank_account_info,
  payment_methods,
  bank_transfer_payment_enabled,
  multi_round_ordering_enabled,
  daily_reports_enabled
) VALUES (
  'Phở Hội',
  'Vinhomes Central Park, HCMC',
  NULL,
  'VND',
  'Asia/Ho_Chi_Minh',
  '{"mon":{"open":"07:00","close":"22:00"},"tue":{"open":"07:00","close":"22:00"},"wed":{"open":"07:00","close":"22:00"},"thu":{"open":"07:00","close":"22:00"},"fri":{"open":"07:00","close":"22:00"},"sat":{"open":"07:00","close":"22:00"},"sun":{"open":"07:00","close":"22:00"}}',
  '{"bank":"Vietcombank","account":"1234567890","holder":"NGUYEN VAN A"}',
  ARRAY['cash', 'bank_transfer'],
  true,
  true,
  true
);

-- ─── staff ────────────────────────────────────────────────────────────────────

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'waiter', 'kitchen')),
  is_active BOOLEAN DEFAULT true,
  pin_code TEXT,                          -- optional 4-digit PIN for quick clock-in
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── tables ───────────────────────────────────────────────────────────────────

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  label TEXT,
  seats INTEGER DEFAULT 4,
  qr_code_url TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  is_active BOOLEAN DEFAULT true
);

-- Seed 10 tables
INSERT INTO tables (table_number, label, seats) VALUES
  (1, 'Bàn 1', 4), (2, 'Bàn 2', 4), (3, 'Bàn 3', 4), (4, 'Bàn 4', 4),
  (5, 'Bàn 5', 4), (6, 'Bàn 6', 6), (7, 'Bàn 7', 6), (8, 'Bàn 8', 6),
  (9, 'Bàn 9', 2), (10, 'Bàn 10', 2);

-- ─── table_sessions ───────────────────────────────────────────────────────────

CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  guest_count INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'billing', 'completed')),
  notes TEXT
);

-- ─── menu_categories ─────────────────────────────────────────────────────────

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Seed categories
INSERT INTO menu_categories (name, display_order) VALUES
  ('Phở Bò', 1),
  ('Phở Gà', 2),
  ('Cơm Tấm', 3),
  ('New Taste', 4),
  ('Gọi Thêm', 5),
  ('Đồ Uống', 6);

-- ─── menu_items ───────────────────────────────────────────────────────────────

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 0) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── orders ───────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_session_id UUID REFERENCES table_sessions(id),
  table_id UUID REFERENCES tables(id),
  order_number SERIAL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── order_items ─────────────────────────────────────────────────────────────

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name TEXT NOT NULL,                -- denormalized for history
  item_price NUMERIC(12, 0) NOT NULL,     -- price at time of order
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

-- ─── bills ────────────────────────────────────────────────────────────────────

CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_session_id UUID REFERENCES table_sessions(id),
  bill_number SERIAL,
  subtotal NUMERIC(12, 0) NOT NULL,
  discount NUMERIC(12, 0) DEFAULT 0,
  total NUMERIC(12, 0) NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'void')),
  generated_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- ─── payments ────────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id),
  method TEXT NOT NULL CHECK (method IN ('cash', 'bank_transfer', 'momo')),
  amount NUMERIC(12, 0) NOT NULL,
  received_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── shifts ───────────────────────────────────────────────────────────────────

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'no_show')),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── shift_reports ────────────────────────────────────────────────────────────

CREATE TABLE shift_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id),
  staff_id UUID REFERENCES staff(id),
  total_orders_served INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 0) DEFAULT 0,
  cash_collected NUMERIC(12, 0) DEFAULT 0,
  cash_expected NUMERIC(12, 0) DEFAULT 0,
  cash_difference NUMERIC(12, 0) DEFAULT 0,
  bank_transfer_total NUMERIC(12, 0) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── daily_reports ────────────────────────────────────────────────────────────

CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 0) DEFAULT 0,
  total_cash NUMERIC(12, 0) DEFAULT 0,
  total_bank_transfer NUMERIC(12, 0) DEFAULT 0,
  total_momo NUMERIC(12, 0) DEFAULT 0,
  total_guests INTEGER DEFAULT 0,
  average_order_value NUMERIC(12, 0) DEFAULT 0,
  top_items JSONB DEFAULT '[]',
  -- e.g. [{ "name": "Pho Bo", "quantity": 42, "revenue": 2100000 }]
  peak_hours JSONB DEFAULT '[]',
  -- e.g. [{ "hour": 12, "orders": 15 }]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE app_config        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables            ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports     ENABLE ROW LEVEL SECURITY;

-- Helper: get current staff role from JWT metadata
CREATE OR REPLACE FUNCTION get_staff_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'guest'
  );
$$ LANGUAGE sql STABLE;

-- Public read: menu categories and items (customers browsing menu)
CREATE POLICY "menu_categories_public_read" ON menu_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "tables_public_read" ON tables
  FOR SELECT USING (is_active = true);

CREATE POLICY "app_config_public_read" ON app_config
  FOR SELECT USING (true);

-- Customers: insert orders and order_items (via table QR scan)
CREATE POLICY "orders_customer_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_customer_insert" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "table_sessions_customer_insert" ON table_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "table_sessions_customer_read" ON table_sessions
  FOR SELECT USING (true);

CREATE POLICY "orders_customer_read" ON orders
  FOR SELECT USING (true);

CREATE POLICY "order_items_customer_read" ON order_items
  FOR SELECT USING (true);

-- Staff: full access to operational tables (requires authenticated session)
CREATE POLICY "staff_read_authenticated" ON staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tables_staff_update" ON tables
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "table_sessions_staff_update" ON table_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "orders_staff_update" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "bills_staff_all" ON bills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "payments_staff_all" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Owner only: settings, staff management, reports
CREATE POLICY "app_config_owner_update" ON app_config
  FOR UPDATE USING (get_staff_role() IN ('owner'));

CREATE POLICY "staff_owner_all" ON staff
  FOR ALL USING (get_staff_role() IN ('owner'));

CREATE POLICY "daily_reports_manager_read" ON daily_reports
  FOR SELECT USING (get_staff_role() IN ('owner', 'manager'));

CREATE POLICY "shifts_staff_read_own" ON shifts
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      get_staff_role() IN ('owner', 'manager') OR
      staff_id = (SELECT id FROM staff WHERE user_id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "shifts_manager_write" ON shifts
  FOR INSERT WITH CHECK (get_staff_role() IN ('owner', 'manager'));

CREATE POLICY "shifts_manager_update" ON shifts
  FOR UPDATE USING (get_staff_role() IN ('owner', 'manager'));

CREATE POLICY "menu_categories_manager_write" ON menu_categories
  FOR ALL USING (get_staff_role() IN ('owner', 'manager'));

CREATE POLICY "menu_items_manager_write" ON menu_items
  FOR ALL USING (get_staff_role() IN ('owner', 'manager'));
