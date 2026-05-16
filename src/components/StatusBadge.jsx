import { STATUS_COLORS } from "../utils/statusFlow";

export default function StatusBadge({ status }) {
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
