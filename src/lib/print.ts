/**
 * Receipt / bill printer utility.
 *
 * Supported paper sizes:
 *   "thermal"  — 80mm roll (thermal receipt printer, USB or Bluetooth)
 *   "A6"       — 105 × 148 mm (small laser/inkjet, card printers)
 *   "A7"       — 74 × 105 mm  (compact card printers, mini printers)
 *
 * Usage:
 *   printOrderReceipt(order, size?)   — kitchen ticket or customer copy
 *   printBillReceipt(bill, size?)     — full itemised bill
 */

export type PaperSize = "thermal" | "A6" | "A7";

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
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function openAndPrint(html: string) {
  const win = window.open("", "_blank", "width=520,height=760,menubar=no,toolbar=no");
  if (!win) {
    alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup để in.\n(Allow popups for this site in browser settings.)");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ─── Per-size CSS ────────────────────────────────────────────────────────────

function css(size: PaperSize): string {
  if (size === "thermal") {
    return `
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        width: 80mm;
        padding: 3mm 4mm;
        color: #000;
        background: #fff;
      }
      @media print {
        @page { size: 80mm auto; margin: 0; }
        body { width: 80mm; }
        .no-print { display: none !important; }
      }
      .shop     { font-size:15px; font-weight:bold; text-align:center; margin-bottom:2px; }
      .addr     { font-size:10px; text-align:center; color:#555; margin-bottom:4px; }
      .meta     { display:flex; justify-content:space-between; font-size:11px; margin:4px 0; }
      hr        { border:none; border-top:1px dashed #000; margin:5px 0; }
      .items    { margin:4px 0; }
      .item-row { display:flex; justify-content:space-between; font-size:12px; margin:2px 0; }
      .item-sub { display:flex; justify-content:space-between; font-size:10px; color:#555; margin-bottom:3px; }
      .summary  { margin:4px 0; }
      .sum-row  { display:flex; justify-content:space-between; font-size:11px; margin:2px 0; }
      .total    { display:flex; justify-content:space-between; font-weight:bold; font-size:14px; margin:5px 0; }
      .footer   { text-align:center; font-size:11px; margin-top:6px; }
      .footer-sub { text-align:center; font-size:9px; color:#555; }
      .print-btn { display:block; margin:14px auto 0; padding:9px 24px; background:#f97316;
                   color:#fff; border:none; border-radius:6px; font-size:13px;
                   font-family:sans-serif; cursor:pointer; }
    `;
  }

  // Shared base for A6 / A7
  const fontSize  = size === "A6" ? "13px" : "11.5px";
  const shopSize  = size === "A6" ? "20px" : "17px";
  const totalSize = size === "A6" ? "18px" : "16px";
  const padding   = size === "A6" ? "10mm" : "7mm";
  const pageSize  = size === "A6" ? "A6 portrait" : "A7 portrait";

  return `
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      font-size: ${fontSize};
      color: #111;
      background: #fff;
      padding: ${padding};
    }
    @media print {
      @page { size: ${pageSize}; margin: ${padding}; }
      body { padding: 0; }
      .no-print { display: none !important; }
    }
    .shop     { font-size:${shopSize}; font-weight:800; letter-spacing:-0.5px; margin-bottom:2px; }
    .addr     { font-size:${size === "A6" ? "11px" : "10px"}; color:#666; margin-bottom:${size === "A6" ? "12px" : "8px"}; }
    .divider  { border:none; border-top:1px solid #ddd; margin:${size === "A6" ? "10px" : "7px"} 0; }
    .divider-bold { border:none; border-top:2px solid #111; margin:${size === "A6" ? "10px" : "7px"} 0; }
    .meta     { display:flex; justify-content:space-between; align-items:baseline;
                font-size:${size === "A6" ? "12px" : "10.5px"}; color:#444; margin-bottom:${size === "A6" ? "10px" : "7px"}; }
    .meta-label { font-weight:600; color:#111; }
    .items    { margin:${size === "A6" ? "8px" : "6px"} 0; }
    .item-row { display:flex; justify-content:space-between; align-items:baseline;
                gap:6px; margin-bottom:${size === "A6" ? "6px" : "4px"}; }
    .item-name { flex:1; font-size:${fontSize}; }
    .item-qty  { font-size:${size === "A6" ? "11px" : "10px"}; color:#666; white-space:nowrap; }
    .item-price{ font-size:${fontSize}; font-weight:600; white-space:nowrap; }
    .summary  { margin-top:${size === "A6" ? "8px" : "6px"}; }
    .sum-row  { display:flex; justify-content:space-between;
                font-size:${size === "A6" ? "12px" : "10.5px"}; color:#555; margin:${size === "A6" ? "4px" : "3px"} 0; }
    .total    { display:flex; justify-content:space-between; font-weight:800;
                font-size:${totalSize}; margin:${size === "A6" ? "8px" : "6px"} 0 ${size === "A6" ? "4px" : "3px"}; }
    .pay-method { font-size:${size === "A6" ? "11px" : "10px"}; color:#666;
                  display:flex; justify-content:space-between; margin-top:3px; }
    .footer   { text-align:center; font-weight:700; font-size:${size === "A6" ? "13px" : "11px"};
                margin-top:${size === "A6" ? "14px" : "10px"}; }
    .footer-sub { text-align:center; font-size:${size === "A6" ? "10px" : "9px"}; color:#888; margin-top:3px; }
    .print-btn { display:block; margin:16px auto 0; padding:10px 28px; background:#f97316;
                 color:#fff; border:none; border-radius:8px; font-size:14px;
                 font-family:sans-serif; cursor:pointer; }
  `;
}

// ─── HTML fragments ──────────────────────────────────────────────────────────

function header(tableNumber: string | number, size: PaperSize, extra?: string) {
  if (size === "thermal") {
    return `
      <div class="shop">PHỞ HỘI</div>
      <div class="addr">Vinhomes Central Park, HCMC</div>
      <hr>
      <div class="meta"><span><b>Bàn ${tableNumber}</b></span><span>${nowStr()}</span></div>
      ${extra ?? ""}
      <hr>
    `;
  }
  return `
    <div class="shop">PHỞ HỘI</div>
    <div class="addr">Vinhomes Central Park, HCMC</div>
    <hr class="divider">
    <div class="meta">
      <span class="meta-label">Bàn ${tableNumber}</span>
      <span>${nowStr()}</span>
    </div>
    ${extra ?? ""}
    <hr class="divider">
  `;
}

function footer(size: PaperSize) {
  if (size === "thermal") {
    return `<hr><div class="footer">Cảm ơn quý khách!</div><div class="footer-sub">Hẹn gặp lại — phohoi-menu.vercel.app</div><div style="margin-top:12px"></div>`;
  }
  return `<hr class="divider"><div class="footer">Cảm ơn quý khách!</div><div class="footer-sub">phohoi-menu.vercel.app</div>`;
}

function itemsBlock(items: PrintItem[], size: PaperSize) {
  if (size === "thermal") {
    return items.map(item => `
      <div class="item-row"><span style="flex:1">${item.name}</span><span style="white-space:nowrap;color:#555;font-size:10px">x${item.quantity}</span></div>
      <div class="item-sub"><span>@${fmt(item.price)}</span><span style="font-weight:bold;color:#000">${fmt(item.price * item.quantity)}</span></div>
    `).join("");
  }
  return `<div class="items">` + items.map(item => `
    <div class="item-row">
      <span class="item-name">${item.name}</span>
      <span class="item-qty">×${item.quantity}</span>
      <span class="item-price">${fmt(item.price * item.quantity)}</span>
    </div>
  `).join("") + `</div>`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function printOrderReceipt(order: PrintableOrder, size: PaperSize = "thermal") {
  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const extra = order.customerName && order.customerName !== "Khách"
    ? (size === "thermal"
        ? `<div style="font-size:10px;margin-bottom:3px">Khách: ${order.customerName}</div>`
        : `<div style="font-size:11px;color:#555;margin-bottom:6px">Khách: ${order.customerName}</div>`)
    : "";

  const totalBlock = size === "thermal"
    ? `<hr><div class="total"><span>TỔNG</span><span>${fmt(total)}</span></div>`
    : `<hr class="divider-bold"><div class="total"><span>TỔNG CỘNG</span><span>${fmt(total)}</span></div>`;

  const notesBlock = order.notes
    ? (size === "thermal"
        ? `<hr><div style="font-size:10px;margin:3px 0">Ghi chú: ${order.notes}</div>`
        : `<hr class="divider"><div style="font-size:11px;color:#555;margin:4px 0">Ghi chú: ${order.notes}</div>`)
    : "";

  const html = `<!DOCTYPE html><html lang="vi"><head>
  <meta charset="utf-8">
  <title>Đơn hàng – Bàn ${order.tableNumber}</title>
  <style>${css(size)}</style>
</head><body>
  ${header(order.tableNumber, size, extra)}
  ${itemsBlock(order.items, size)}
  ${totalBlock}
  ${notesBlock}
  ${footer(size)}
  <button class="print-btn no-print" onclick="window.print()">In biên lai</button>
  <script>window.onload = () => { window.print(); }</script>
</body></html>`;

  openAndPrint(html);
}

export function printBillReceipt(bill: PrintableBill, size: PaperSize = "thermal") {
  const paymentLabel = bill.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản";
  const sessionNote = bill.orderCount
    ? (size === "thermal"
        ? `<div style="font-size:10px;color:#555;margin-bottom:3px">${bill.orderCount} đơn trong phiên</div>`
        : `<div style="font-size:11px;color:#666;margin-bottom:6px">${bill.orderCount} đơn trong phiên</div>`)
    : "";

  const summaryBlock = size === "thermal" ? `
    <hr>
    <div class="sum-row"><span>Tạm tính</span><span>${fmt(bill.subtotal)}</span></div>
    ${bill.discount > 0 ? `<div class="sum-row"><span>Giảm giá</span><span>-${fmt(bill.discount)}</span></div>` : ""}
    <hr>
    <div class="total"><span>TỔNG CỘNG</span><span>${fmt(bill.total)}</span></div>
    <div class="sum-row" style="font-size:10px;color:#555"><span>Thanh toán</span><span>${paymentLabel}</span></div>
  ` : `
    <hr class="divider">
    <div class="summary">
      <div class="sum-row"><span>Tạm tính</span><span>${fmt(bill.subtotal)}</span></div>
      ${bill.discount > 0 ? `<div class="sum-row"><span>Giảm giá</span><span>-${fmt(bill.discount)}</span></div>` : ""}
    </div>
    <hr class="divider-bold">
    <div class="total"><span>TỔNG CỘNG</span><span>${fmt(bill.total)}</span></div>
    <div class="pay-method"><span>Phương thức</span><span>${paymentLabel}</span></div>
  `;

  const html = `<!DOCTYPE html><html lang="vi"><head>
  <meta charset="utf-8">
  <title>Hóa đơn – Bàn ${bill.tableNumber}</title>
  <style>${css(size)}</style>
</head><body>
  ${header(bill.tableNumber ?? "—", size, sessionNote)}
  ${itemsBlock(bill.items, size)}
  ${summaryBlock}
  ${footer(size)}
  <button class="print-btn no-print" onclick="window.print()">In hóa đơn</button>
  <script>window.onload = () => { window.print(); }</script>
</body></html>`;

  openAndPrint(html);
}
