import type { User } from "../types";

interface Props {
  total:          number;
  loading:        boolean;
  liveMode:       boolean;
  onToggleLive:   () => void;
  user:           User;
  onLogout:       () => void;
  newCount:       number;
  onManageUsers:  () => void;  // ← add this
}

export function TopBar({ total, loading, liveMode, onToggleLive, user, onLogout, newCount, onManageUsers }: Props) {
  return (
    <div style={{ height: "48px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", padding: "0 20px", gap: "16px", flexShrink: 0, background: "#0d1117" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 6px #3b82f6" }} />
        <span style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#e6edf3" }}>LOGSTREAM</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* New logs badge */}
      {newCount > 0 && (
        <span style={{ fontSize: "11px", color: "#22c55e", fontFamily: "monospace", background: "#0d2010", padding: "2px 8px", borderRadius: "3px", border: "1px solid #22c55e33" }}>
          +{newCount} new
        </span>
      )}

      {/* Total */}
      {total > 0 && (
        <span style={{ fontSize: "11px", color: "#555", fontFamily: "monospace" }}>
          <span style={{ color: "#3b82f6", fontWeight: 700 }}>{total.toLocaleString()}</span> logs
        </span>
      )}

      {/* Live toggle */}
      <button
        onClick={onToggleLive}
        style={{ background: liveMode ? "#0d2d1a" : "#0d1117", border: `1px solid ${liveMode ? "#22c55e" : "#21262d"}`, borderRadius: "4px", color: liveMode ? "#22c55e" : "#555", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.05em" }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: liveMode ? "#22c55e" : "#555", animation: liveMode ? "pulse 1.5s infinite" : "none" }} />
        LIVE
      </button>

      {loading && <span style={{ fontSize: "11px", color: "#3b82f6", fontFamily: "monospace" }}>SEARCHING…</span>}

      {/* User info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid #21262d", paddingLeft: "12px" }}>
        <span style={{ fontSize: "11px", color: "#666", fontFamily: "monospace" }}>{user.username}</span>

        {/* USERS button — admin only */}
        {user.role === "admin" && (
          <button
            onClick={onManageUsers}
            style={{ background: "none", border: "1px solid #21262d", borderRadius: "3px", color: "#555", padding: "3px 8px", fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}
          >
            USERS
          </button>
        )}

        <button
          onClick={onLogout}
          style={{ background: "none", border: "1px solid #21262d", borderRadius: "3px", color: "#555", padding: "3px 8px", fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}
        >LOGOUT</button>
      </div>
    </div>
  );
}