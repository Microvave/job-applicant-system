import { useState, useEffect, useMemo } from "react";
import { useApplicants } from "../hooks/useApplicants";
import { STATUS_COLORS, STATUSES } from "../utils/statusFlow";
import { btnStyle } from "../utils/styles";
import StatusBadge from "../components/StatusBadge";
import ApplicantForm from "../components/ApplicantForm";
import SearchFilterBar from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";

const PAGE_SIZE = 10;

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

export default function ApplicantsPage() {
  const { applicants, loading, saving, error, fetchAll, handleCreate, handleUpdate, handleDelete } = useApplicants();

  const [toast, setToast]               = useState(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortDir, setSortDir]           = useState("desc");
  const [page, setPage]                 = useState(1);

  const showToast = (message, type = "success") => setToast({ message, type });

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

  useEffect(() => setPage(1), [search, filterStatus, sortDir]);

  const onCreateSave = async (form) => {
    try {
      await handleCreate(form);
      showToast("เพิ่มผู้สมัครสำเร็จ ✓");
      setFormOpen(false);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const onUpdateSave = async (form) => {
    try {
      await handleUpdate(editTarget.id, form);
      showToast("แก้ไขข้อมูลสำเร็จ ✓");
      setEditTarget(null);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const onDeleteConfirm = async () => {
    try {
      await handleDelete(deleteTarget.id);
      showToast("ลบข้อมูลสำเร็จ ✓");
      setDeleteTarget(null);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

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
            ].map(({ label, val }) => (
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
                    {["ชื่อ-นามสกุล", "Email", "เบอร์โทร", "ตำแหน่ง", "สถานะ", "วันที่สมัคร", "จัดการ"].map(h => (
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
          onSave={editTarget ? onUpdateSave : onCreateSave}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ "${deleteTarget.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
          onConfirm={onDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
