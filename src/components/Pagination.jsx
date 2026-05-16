import { btnStyle } from "../utils/styles";

export default function Pagination({ page, totalPages, onPage }) {
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
