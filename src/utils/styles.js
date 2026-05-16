export function btnStyle(variant) {
  const base = {
    padding: "8px 20px", borderRadius: 8, border: "none",
    cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s",
  };
  if (variant === "primary") return { ...base, background: "#3b82f6", color: "#fff" };
  if (variant === "danger")  return { ...base, background: "#ef4444", color: "#fff" };
  if (variant === "success") return { ...base, background: "#10b981", color: "#fff" };
  return { ...base, background: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0" };
}

export const inputStyle = (hasError) => ({
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
  fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
  transition: "border 0.15s",
});
