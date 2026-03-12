/**
 * Thermal receipt printer utility.
 * Works with any USB/Bluetooth thermal printer set as the system default printer.
 * Optimised for 80mm paper width (supports 58mm too — set via @page size below).
 *
 * Usage:
 *   printOrderReceipt(order)  — customer order ticket (kitchen copy or customer copy)
 *   printBillReceipt(bill)    — full itemised bill for payment
 */

export interface PrintItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PrintableOrder {
  id: string;
  tableNumber: string | number;
  items: PrintItem[];
  notes?: string;
  customerName?: string;
}

export interface PrintableBill {
  tableNumber: number | null;
  items: PrintItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "bank_transfer";
  orderCount?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function nowStr() {
  return new Date().toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Open a popup, write HTML, auto-print then close. */
function openAndPrint(html: string) {
  const win = window.open("", "_blank", "width=420,height=700,menubar=no,toolbar=no");
  if (!win) {
    alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup để in.\n(Allow popups for this site in browser settings.)");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ─── Shared receipt CSS ──────────────────────────────────────────────────────

const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    width: 80mm;
    padding: 3mm 4mm;
    color: #000;
    background: #fff;
  }
  @media print {
    @page {
      /* Change to "58mm auto" for 58mm paper */
      size: 80mm auto;
      margin: 0;
    }
    body { width: 80mm; }
    .no-print { display: none !important; }
  }
  .center  { text-align: center; }
  .right   { text-align: right; }
  .bold    { font-weight: bold; }
  .big     { font-size: 15px; }
  .small   { font-size: 10px; }
  .muted   { color: #555; }
  hr       { border: none; border-top: 1px dashed #000; margin: 5px 0; }
  .row     { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; margin: 2px 0; }
  .grow    { flex: 1; }
  .nowrap  { white-space: nowrap; }
  .mt2     { margin-top: 6px; }
  .mb2     { margin-bottom: 6px; }
  .mt4     { margin-top: 12px; }
  /* Print button shown on screen only */
  .print-btn {
    display: block;
    margin: 16px auto 0;
    padding: 10px 28px;
    background: #f97316;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-family: sans-serif;
    cursor: pointer;
  }
`;

// ─── Header / Footer shared fragments ────────────────────────────────────────

function receiptHeader(tableNumber: string | number, extra?: string) {
  return `
    <div class="center bold big mb2">PHỞ HỘI</div>
    <div class="center small muted mb2">Vinhomes Central Park, HCMC</div>
    <hr>
    <div class="row mt2 mb2">
      <span class="bold">Bàn ${tableNumber}</span>
      <span class="small">${nowStr()}</span>
    </div>
    ${extra ?? ""}
    <hr>
  `;
}

function receiptFooter() {
  return `
    <hr>
    <div class="center bold mt2 mb2">Cảm ơn quý khách!</div>
    <div class="center small muted">Hẹn gặp lại — phohoi-menu.vercel.app</div>
    <div class="mt4"></div>
  `;
}

function itemsHtml(items: PrintItem[]) {
  return items.map(item => `
    <div class="row mt2">
      <span class="grow">${item.name}</span>
      <span class="nowrap muted small">x${item.quantity}</span>
    </div>
    <div class="row">
      <span class="small muted">@${fmt(item.price)}</span>
      <span class="nowrap bold">${fmt(item.price * item.quantity)}</span>
    </div>
  `).join("");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Print an order receipt — use for:
 *   • Kitchen ticket (staff prints from orders page)
 *   • Customer receipt (shown after order is submitted)
 */
export function printOrderReceipt(order: PrintableOrder) {
  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const html = `<!DOCTYPE html>
<html lang="vi"><head>
  <meta charset="utf-8">
  <title>Đơn hàng – Bàn ${order.tableNumber}</title>
  <style>${BASE_CSS}</style>
</head><body>
  ${receiptHeader(order.tableNumber, order.customerName && order.customerName !== "Khách" ? `<div class="mb2 small">Khách: ${order.customerName}</div>` : "")}
  ${itemsHtml(order.items)}
  <hr>
  <div class="row mt2 bold big">
    <span>TỔNG</span>
    <span>${fmt(total)}</span>
  </div>
  ${order.notes ? `<hr><div class="small mt2 mb2">Ghi chú: ${order.notes}</div>` : ""}
  ${receiptFooter()}
  <button class="print-btn no-print" onclick="window.print()">In biên lai</button>
  <script>window.onload = () => { window.print(); }</script>
</body></html>`;

  openAndPrint(html);
}

/**
 * Print a bill receipt — use for:
 *   • Staff billing page after payment confirmed
 *   • Full itemised bill with discount and payment method
 */
export function printBillReceipt(bill: PrintableBill) {
  const paymentLabel = bill.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản";

  const html = `<!DOCTYPE html>
<html lang="vi"><head>
  <meta charset="utf-8">
  <title>Hóa đơn – Bàn ${bill.tableNumber}</title>
  <style>${BASE_CSS}</style>
</head><body>
  ${receiptHeader(
    bill.tableNumber ?? "—",
    bill.orderCount ? `<div class="small muted mb2">${bill.orderCount} đơn trong phiên</div>` : ""
  )}
  ${itemsHtml(bill.items)}
  <hr>
  <div class="row mt2">
    <span>Tạm tính</span>
    <span>${fmt(bill.subtotal)}</span>
  </div>
  ${bill.discount > 0 ? `
  <div class="row">
    <span>Giảm giá</span>
    <span>-${fmt(bill.discount)}</span>
  </div>` : ""}
  <hr>
  <div class="row mt2 bold big">
    <span>TỔNG CỘNG</span>
    <span>${fmt(bill.total)}</span>
  </div>
  <div class="row mt2 small">
    <span class="muted">Thanh toán</span>
    <span>${paymentLabel}</span>
  </div>
  ${receiptFooter()}
  <button class="print-btn no-print" onclick="window.print()">In hóa đơn</button>
  <script>window.onload = () => { window.print(); }</script>
</body></html>`;

  openAndPrint(html);
}
