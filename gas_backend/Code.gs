// ============================
// Google Apps Script - Job Applicant Management System
// ============================

const SHEET_NAME = "Applicants";
const HEADERS = ["id", "name", "phone", "email", "position", "status", "note", "created_at"];

// Status flow: valid transitions only
const STATUS_FLOW = {
  Applied: ["Interview", "Rejected"],
  Interview: ["Passed", "Rejected"],
  Passed: [],
  Rejected: [],
};

// ============================
// CORS Helper
// ============================
function setCORSHeaders(output) {
  return output
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doOptions(e) {
  return setCORSHeaders(
    ContentService.createTextOutput("")
  ).setMimeType(ContentService.MimeType.TEXT);
}

// ============================
// Response Helpers
// ============================
function successResponse(data, message = "Success") {
  const payload = JSON.stringify({ success: true, message, data });
  return setCORSHeaders(
    ContentService.createTextOutput(payload)
  ).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message, code = 400) {
  const payload = JSON.stringify({ success: false, message, data: null });
  return setCORSHeaders(
    ContentService.createTextOutput(payload)
  ).setMimeType(ContentService.MimeType.JSON);
}

// ============================
// Sheet Helpers
// ============================
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function getAllRows(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function findRowIndexById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function generateId() {
  return Utilities.getUuid();
}

// ============================
// Validation
// ============================
function validateApplicant(data, isUpdate = false) {
  const errors = [];
  if (!isUpdate) {
    if (!data.name || data.name.trim() === "") errors.push("Name is required");
    if (!data.email || data.email.trim() === "") errors.push("Email is required");
    if (!data.phone || data.phone.trim() === "") errors.push("Phone is required");
    if (!data.position || data.position.trim() === "") errors.push("Position is required");
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }
  if (data.phone && !/^\d{9,15}$/.test(data.phone.replace(/[-\s]/g, ""))) {
    errors.push("Phone must be 9-15 digits");
  }
  return errors;
}

function checkDuplicate(sheet, email, phone, excludeId = null) {
  const rows = getAllRows(sheet);
  return rows.some(row => {
    if (excludeId && String(row.id) === String(excludeId)) return false;
    return (
      (email && row.email && row.email.toLowerCase() === email.toLowerCase()) ||
      (phone && row.phone && row.phone.replace(/[-\s]/g, "") === phone.replace(/[-\s]/g, ""))
    );
  });
}

function validateStatusTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowed = STATUS_FLOW[currentStatus] || [];
  return allowed.includes(newStatus);
}

// ============================
// Router
// ============================
function doGet(e) {
  try {
    const action = e.parameter.action || "list";
    const sheet = getSheet();

    if (action === "list") return handleGetList(e, sheet);
    if (action === "get") return handleGetOne(e, sheet);

    return errorResponse("Unknown action");
  } catch (err) {
    return errorResponse("Server error: " + err.message, 500);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || "create";
    const sheet = getSheet();

    if (action === "create") return handleCreate(body, sheet);
    if (action === "update") return handleUpdate(body, sheet);
    if (action === "delete") return handleDelete(body, sheet);

    return errorResponse("Unknown action");
  } catch (err) {
    return errorResponse("Server error: " + err.message, 500);
  }
}

// ============================
// Handlers
// ============================
function handleGetList(e, sheet) {
  const rows = getAllRows(sheet);
  return successResponse(rows, "Fetched successfully");
}

function handleGetOne(e, sheet) {
  const id = e.parameter.id;
  if (!id) return errorResponse("ID is required");
  const rows = getAllRows(sheet);
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) return errorResponse("Applicant not found", 404);
  return successResponse(found);
}

function handleCreate(body, sheet) {
  const errors = validateApplicant(body);
  if (errors.length > 0) return errorResponse(errors.join(", "));

  if (checkDuplicate(sheet, body.email, body.phone)) {
    return errorResponse("Email or Phone already exists (duplicate)");
  }

  const id = generateId();
  const now = new Date().toISOString();
  const status = "Applied";
  const note = body.note || "";

  sheet.appendRow([
    id,
    body.name.trim(),
    body.phone.trim(),
    body.email.trim().toLowerCase(),
    body.position.trim(),
    status,
    note,
    now,
  ]);

  return successResponse({ id, status, created_at: now }, "Applicant created successfully");
}

function handleUpdate(body, sheet) {
  if (!body.id) return errorResponse("ID is required");

  const rowIndex = findRowIndexById(sheet, body.id);
  if (rowIndex === -1) return errorResponse("Applicant not found", 404);

  const rows = getAllRows(sheet);
  const current = rows.find(r => String(r.id) === String(body.id));
  if (!current) return errorResponse("Applicant not found", 404);

  // Status transition check
  if (body.status && body.status !== current.status) {
    if (!validateStatusTransition(current.status, body.status)) {
      return errorResponse(
        `Invalid status transition: ${current.status} → ${body.status}`
      );
    }
  }

  // Validate fields if provided
  const partial = {};
  if (body.email) partial.email = body.email;
  if (body.phone) partial.phone = body.phone;
  const errors = validateApplicant(partial, true);
  if (errors.length > 0) return errorResponse(errors.join(", "));

  // Duplicate check excluding self
  if (body.email || body.phone) {
    if (checkDuplicate(sheet, body.email || current.email, body.phone || current.phone, body.id)) {
      return errorResponse("Email or Phone already exists (duplicate)");
    }
  }

  // Build updated row
  const updated = {
    id: current.id,
    name: body.name ? body.name.trim() : current.name,
    phone: body.phone ? body.phone.trim() : current.phone,
    email: body.email ? body.email.trim().toLowerCase() : current.email,
    position: body.position ? body.position.trim() : current.position,
    status: body.status || current.status,
    note: body.note !== undefined ? body.note : current.note,
    created_at: current.created_at,
  };

  const row = HEADERS.map(h => updated[h]);
  const range = sheet.getRange(rowIndex, 1, 1, HEADERS.length);
  range.setValues([row]);

  return successResponse(updated, "Applicant updated successfully");
}

function handleDelete(body, sheet) {
  if (!body.id) return errorResponse("ID is required");

  const rowIndex = findRowIndexById(sheet, body.id);
  if (rowIndex === -1) return errorResponse("Applicant not found", 404);

  sheet.deleteRow(rowIndex);
  return successResponse({ id: body.id }, "Applicant deleted successfully");
}
