import { useState, useEffect, useCallback, useMemo } from "react";

// ============================
// CONFIG - ใส่ GAS URL ของคุณตรงนี้
// ============================
const GAS_URL = "https://script.google.com/macros/s/AKfycbyU0_AeSrVtnUEnf4klu6oO2flcqWHv2qMVKZbEVdqrvdD2ntEoT7tXuCEULebXaxjdgg/exec";

// ============================
// STATUS CONFIG
// ============================
const STATUS_FLOW = {
  Applied: ["Interview", "Rejected"],
  Interview: ["Passed", "Rejected"],
  Passed: [],
  Rejected: [],
};

const STATUS_COLORS = {
  Applied:   { bg: "#e8f4fd", text: "#1a6fa8", border: "#90cdf4" },
  Interview: { bg: "#fef3c7", text: "#92400e", border: "#f6d860" },
  Passed:    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  Rejected:  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

const STATUSES = ["Applied", "Interview", "Passed", "Rejected"];
const POSITIONS = ["Frontend Developer","Backend Developer","Fullstack Developer","DevOps Engineer","UX/UI Designer","Product Manager","QA Engineer","Data Engineer","Data Scientist","Business Analyst"];

// ============================
// API SERVICE
// ============================
const api = {
  async get(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${GAS_URL}?${qs}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
  async post(body) {
  const formData = new URLSearchParams();
  formData.append("data", JSON.stringify(body));
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
},
  list:   ()     => api.get({ action: "list" }),
  create: (body) => api.post({ action: "create", ...body }),
  update: (body) => api.post({ action: "update", ...body }),
  delete: (id)   => api.post({ action: "delete", id }),
};

// ============================
// VALIDATION UTILS
// ============================
function validateForm(data, isEdit = false) {
  const errors = {};
  if (!isEdit || data.name !== undefined) {
    if (!data.name?.trim()) errors.name = "กรุณากรอกชื่อ";
  }
  if (!isEdit || data.email !== undefined) {
    if (!data.email?.trim()) errors.email = "กรุณากรอก Email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "รูปแบบ Email ไม่ถูกต้อง";
  }
  if (!isEdit || data.phone !== undefined) {
    if (!data.phone?.trim()) errors.phone = "กรุณากรอกเบอร์โทร";
    else if (!/^\d{9,15}$/.test(data.phone.replace(/[-\s]/g, ""))) errors.phone = "เบอร์โทรต้องเป็นตัวเลข 9-15 หลัก";
  }
  if (!isEdit || data.position !== undefined) {
    if (!data.position?.trim()) errors.position = "กรุณาเลือกตำแหน่ง";
  }
  return errors;
}

// ============================
// COMPONENTS
// ============================

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.text, border: `1.5px solid ${c.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, opacity: 0.7 }} />
      {status}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
      <div style={{
        width: 36, height: 36, border: "3px solid #e5e7eb",
        borderTop: "3px solid #3b82f6", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#10b981", error: "#ef4444", info: "#3b82f6" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#1e293b", color: "#fff", borderRadius: 12,
      padding: "12px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: 10,
      borderLeft: `4px solid ${colors[type] || colors.info}`,
      animation: "slideIn 0.3s ease",
      maxWidth: 360, fontSize: 14,
    }}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.15s ease",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 32px",
        maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "scaleIn 0.15s ease",
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1e293b" }}>ยืนยันการลบ</h3>
        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={btnStyle("secondary")}>ยกเลิก</button>
          <button onClick={onConfirm} style={btnStyle("danger")}>ลบ</button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(variant) {
  const base = { padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s" };
  if (variant === "primary") return { ...base, background: "#3b82f6", color: "#fff" };
  if (variant === "danger")  return { ...base, background: "#ef4444", color: "#fff" };
  if (variant === "success") return { ...base, background: "#10b981", color: "#fff" };
  return { ...base, background: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0" };
}

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
      {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
  fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
  transition: "border 0.15s",
});

// ============================
// APPLICANT FORM MODAL
// ============================
function ApplicantForm({ initial, onSave, onClose, loading }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    position: initial?.position || "",
    status: initial?.status || "Applied",
    note: initial?.note || "",
  });
  const [errors, setErrors] = useState({});

  const allowedStatuses = isEdit
    ? [initial.status, ...(STATUS_FLOW[initial.status] || [])]
    : ["Applied"];

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const errs = validateForm(form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    onSave(form);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", animation: "fadeIn 0.15s ease",
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, padding: "28px", maxWidth: 500,
        width: "100%", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.15s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
            {isEdit ? "✏️ แก้ไขข้อมูล" : "➕ เพิ่มผู้สมัคร"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>

        <FormField label="ชื่อ-นามสกุล *" error={errors.name}>
          <input value={form.name} onChange={set("name")} placeholder="เช่น สมชาย ใจดี" style={inputStyle(errors.name)} />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Email *" error={errors.email}>
            <input value={form.email} onChange={set("email")} placeholder="email@example.com" style={inputStyle(errors.email)} />
          </FormField>
          <FormField label="เบอร์โทร *" error={errors.phone}>
            <input value={form.phone} onChange={set("phone")} placeholder="0812345678" style={inputStyle(errors.phone)} />
          </FormField>
        </div>

        <FormField label="ตำแหน่งที่สมัคร *" error={errors.position}>
          <select value={form.position} onChange={set("position")} style={inputStyle(errors.position)}>
            <option value="">-- เลือกตำแหน่ง --</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </FormField>

        {isEdit && (
          <FormField label="สถานะ">
            <select value={form.status} onChange={set("status")} style={inputStyle(false)}>
              {allowedStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
              สถานะที่เปลี่ยนได้จาก {initial.status}: {STATUS_FLOW[initial.status]?.join(", ") || "ไม่สามารถเปลี่ยนได้"}
            </p>
          </FormField>
        )}

        <FormField label="หมายเหตุ">
          <textarea value={form.note} onChange={set("note")} placeholder="บันทึกเพิ่มเติม..." rows={3}
            style={{ ...inputStyle(false), resize: "vertical", fontFamily: "inherit" }} />
        </FormField>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={btnStyle("secondary")} disabled={loading}>ยกเลิก</button>
          <button onClick={handleSubmit} style={btnStyle("primary")} disabled={loading}>
            {loading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้สมัคร"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// SEARCH / FILTER / SORT BAR
// ============================
function SearchFilterBar({ search, setSearch, filterStatus, setFilterStatus, sortDir, setSortDir }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
      <div style={{ flex: "1 1 200px", position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อผู้สมัคร..."
          style={{ ...inputStyle(false), paddingLeft: 34, width: "100%" }}
        />
      </div>
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        style={{ ...inputStyle(false), flex: "0 1 160px" }}>
        <option value="">ทุกสถานะ</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
        style={{ ...btnStyle("secondary"), whiteSpace: "nowrap" }}>
        {sortDir === "desc" ? "↓ ล่าสุดก่อน" : "↑ เก่าสุดก่อน"}
      </button>
    </div>
  );
}

// ============================
// PAGINATION
// ============================
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 20 }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} style={btnStyle("secondary")}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} style={{
          ...btnStyle(p === page ? "primary" : "secondary"),
          minWidth: 36, padding: "8px 0",
        }}>{p}</button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} style={btnStyle("secondary")}>›</button>
    </div>
  );
}

// ============================
// MAIN APP
// ============================
const PAGE_SIZE = 10;

export default function App() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortDir, setSortDir]       = useState("desc");
  const [page, setPage]             = useState(1);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch all
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await api.list();
      setApplicants(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Filter / Sort / Search
  const filtered = useMemo(() => {
    let rows = [...applicants];
    if (search.trim()) rows = rows.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) rows = rows.filter(r => r.status === filterStatus);
    rows.sort((a, b) => {
      const da = new Date(a.created_at), db = new Date(b.created_at);
      return sortDir === "desc" ? db - da : da - db;
    });
    return rows;
  }, [applicants, search, filterStatus, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [search, filterStatus, sortDir]);

  // CREATE
  const handleCreate = async (form) => {
    try {
      setSaving(true);
      await api.create(form);
      showToast("เพิ่มผู้สมัครสำเร็จ ✓");
      setFormOpen(false);
      fetchAll();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // UPDATE
  const handleUpdate = async (form) => {
    try {
      setSaving(true);
      await api.update({ id: editTarget.id, ...form });
      showToast("แก้ไขข้อมูลสำเร็จ ✓");
      setEditTarget(null);
      fetchAll();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      setSaving(true);
      await api.delete(deleteTarget.id);
      showToast("ลบข้อมูลสำเร็จ ✓");
      setDeleteTarget(null);
      fetchAll();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Sarabun', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        button:hover { opacity: 0.87; }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        tr:hover td { background: #f8fafc !important; }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .table-wrap { overflow-x: auto; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", color: "#fff", padding: "24px 24px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>📋 Job Applicant System</h1>
              <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: 14 }}>ระบบจัดการผู้สมัครงาน</p>
            </div>
            <button
              onClick={() => { setEditTarget(null); setFormOpen(true); }}
              style={{ ...btnStyle("primary"), background: "#fff", color: "#2563eb", fontWeight: 700, padding: "10px 20px" }}
            >
              + เพิ่มผู้สมัคร
            </button>
          </div>

          {/* STATS */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            {[
              { label: "ทั้งหมด", val: applicants.length, color: "#60a5fa" },
              ...STATUSES.map(s => ({ label: s, val: applicants.filter(a => a.status === s).length, color: STATUS_COLORS[s].border }))
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 18px",
                backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{val}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: "-36px auto 0", padding: "0 16px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 0" }}>
            <SearchFilterBar
              search={search} setSearch={setSearch}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              sortDir={sortDir} setSortDir={setSortDir}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                แสดง {paginated.length} จาก {filtered.length} รายการ
              </span>
            </div>
          </div>

          {loading ? <Spinner /> : error ? (
            <div style={{ padding: "32px 24px", textAlign: "center", color: "#ef4444" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <p style={{ margin: 0, fontWeight: 600 }}>เกิดข้อผิดพลาด</p>
              <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#94a3b8" }}>{error}</p>
              <button onClick={fetchAll} style={btnStyle("primary")}>ลองใหม่</button>
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>ไม่พบข้อมูล</p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>ลองเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["ชื่อ-นามสกุล","Email","เบอร์โทร","ตำแหน่ง","สถานะ","วันที่สมัคร","จัดการ"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1e293b" }}>{a.name}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{a.email}</td>
                      <td className="hide-mobile" style={{ padding: "12px 16px", color: "#475569" }}>{a.phone}</td>
                      <td className="hide-mobile" style={{ padding: "12px 16px", color: "#475569" }}>{a.position}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={a.status} /></td>
                      <td className="hide-mobile" style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <button onClick={() => setEditTarget(a)}
                          style={{ ...btnStyle("secondary"), marginRight: 6, padding: "6px 12px", fontSize: 12 }}>✏️</button>
                        <button onClick={() => setDeleteTarget(a)}
                          style={{ ...btnStyle("secondary"), padding: "6px 12px", fontSize: 12, color: "#ef4444" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div style={{ padding: "16px 24px 24px" }}>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {(formOpen || editTarget) && (
        <ApplicantForm
          initial={editTarget}
          onSave={editTarget ? handleUpdate : handleCreate}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ "${deleteTarget.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
