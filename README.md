# Phở Hội – Restaurant Management System

QR-based dine-in ordering for Phở Hội, Vinhomes Central Park, HCMC.

## Routes

| URL | Who | Description |
|-----|-----|-------------|
| `/` | Anyone | Landing page |
| `/menu` | Customer | Browse-only menu (no cart) |
| `/table/[number]` | Customer | QR ordering — scan QR at table |
| `/login` | Staff | Staff login |
| `/dashboard/orders` | Staff | Live order management |
| `/dashboard/tables` | Staff | Table status & sessions |
| `/dashboard/billing` | Staff | Bill generation & payment |
| `/settings` | Owner | App config & feature toggles |
| `/settings/menu` | Owner | Toggle item availability |
| `/settings/staff` | Owner | Manage staff accounts |
| `/settings/tables` | Owner | Tables & QR code printing |

## Test Accounts

> Login at `/login`. Auth is currently a dev stub — any non-empty email + password works.
> Replace with Supabase Auth once credentials are configured.

| Name | Email | Role | Notes |
|------|-------|------|-------|
| Ann | ngoan.n.tr@gmail.com | Owner | Full access |
| Minh | minh@phohoi.vn | Waiter | Floor staff |
| Tuấn | tuan@phohoi.vn | Kitchen | Kitchen display |

**Password (dev only):** any non-empty string, e.g. `test1234`

## Customer QR Testing

Visit `/table/1` through `/table/10` directly in the browser to simulate a customer scanning a QR code at the table.

## Getting Started

```bash
npm install
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is in use).

## Environment Variables

Copy `.env.local` and fill in Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Until Supabase is connected, the app uses an in-memory store — data resets on server restart.

## Database Setup

Run the migration after connecting Supabase:

```bash
# From the phohoi-menu directory
supabase db push
# or apply manually:
# supabase/migrations/001_initial_schema.sql
```
