import { STATUSES } from "../utils/statusFlow";
import { btnStyle, inputStyle } from "../utils/styles";

export default function SearchFilterBar({ search, setSearch, filterStatus, setFilterStatus, sortDir, setSortDir }) {
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
