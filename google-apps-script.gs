/*
 * DESHI DEALZ — Google Sheets order receiver
 *
 * Setup:
 * 1. Create a new Google Sheet and name the first tab "Orders".
 * 2. In that Sheet, open Extensions -> Apps Script.
 * 3. Replace the editor contents with this file's code and Save.
 * 4. Deploy -> New deployment -> Select type: Web app.
 * 5. Execute as: Me. Access: Anyone (or "Anyone with the link", depending on UI).
 * 6. Deploy, authorize it, copy the Web app URL ending in /exec.
 * 7. Paste that URL into STORE_CONFIG.APPS_SCRIPT_URL in script.js.
 *
 * Security note: the public storefront endpoint accepts public order submissions.
 * Validate/monitor submissions and never put payment PINs, OTPs, or secrets in the form.
 * Google Apps Script web apps have request-size and quota limits.
 */

const SHEET_NAME = "Orders";
const HEADERS = [
  "Created At", "Order ID", "Customer Name", "Phone", "Address",
  "District", "Delivery Area", "Payment Method", "Payment Reference",
  "Note", "Items JSON", "Subtotal BDT", "Delivery Fee BDT", "Total BDT", "Status"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) return jsonResponse({ ok: false, error: "Empty request body" });

    const order = JSON.parse(raw);
    const validationError = validateOrder_(order);
    if (validationError) return jsonResponse({ ok: false, error: validationError });

    lock.waitLock(10000);
    const sheet = getOrdersSheet_();
    const itemsJson = JSON.stringify(order.items).slice(0, 45000);
    const row = [
      new Date(),
      safeCell_(order.orderId),
      safeCell_(order.customerName),
      safeCell_(order.phone),
      safeCell_(order.address),
      safeCell_(order.district),
      safeCell_(order.deliveryArea),
      safeCell_(order.paymentMethod),
      safeCell_(order.paymentReference || ""),
      safeCell_(order.note || ""),
      itemsJson,
      Number(order.subtotal),
      Number(order.deliveryFee),
      Number(order.total),
      "New"
    ];
    sheet.appendRow(row);
    return jsonResponse({ ok: true, orderId: order.orderId });
  } catch (err) {
    return jsonResponse({ ok: false, error: "Could not save order" });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "Deshi Dealz order endpoint", message: "Endpoint is live." });
}

function getOrdersSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Bind this script to the target Google Sheet.");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function validateOrder_(o) {
  if (!o || typeof o !== "object") return "Invalid order";
  if (!o.orderId || !o.customerName || !o.phone || !o.address || !o.district) return "Missing required fields";
  if (!Array.isArray(o.items) || o.items.length < 1 || o.items.length > 50) return "Invalid items";
  if (!["Dhaka", "Outside Dhaka"].includes(o.deliveryArea)) return "Invalid delivery area";
  if (!["Cash on Delivery", "bKash", "Nagad"].includes(o.paymentMethod)) return "Invalid payment method";
  const subtotal = Number(o.subtotal), fee = Number(o.deliveryFee), total = Number(o.total);
  const expectedFee = o.deliveryArea === "Dhaka" ? 90 : 110;
  if (!Number.isFinite(subtotal) || !Number.isFinite(fee) || !Number.isFinite(total)) return "Invalid amount";
  if (fee !== expectedFee || total !== subtotal + fee || subtotal < 0) return "Invalid totals";
  for (const item of o.items) {
    if (!item || !item.product || !item.size || !item.color ||
        !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 ||
        !Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0) return "Invalid item";
  }
  return "";
}

// Prevent user-entered text from being interpreted as a spreadsheet formula.
function safeCell_(value) {
  const s = String(value == null ? "" : value).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
