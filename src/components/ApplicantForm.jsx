import { useState } from "react";
import { STATUS_FLOW, POSITIONS } from "../utils/statusFlow";
import { validateForm } from "../utils/validation";
import { btnStyle, inputStyle } from "../utils/styles";

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
      {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

export default function ApplicantForm({ initial, onSave, onClose, loading }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name:     initial?.name     || "",
    email:    initial?.email    || "",
    phone:    initial?.phone    || "",
    position: initial?.position || "",
    status:   initial?.status   || "Applied",
    note:     initial?.note     || "",
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
