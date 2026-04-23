import { useState, useEffect, useCallback } from "react";
import type { User, UserRole } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function getToken() {
  return localStorage.getItem("token");
}

interface UserRecord {
  id:        string;
  username:  string;
  role:      UserRole;
  createdBy: string | null;
  createdAt: string;
}

export function UsersPage({ currentUser, onClose }: { currentUser: User; onClose: () => void }) {
  const [users,    setUsers]    = useState<UserRecord[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [success,  setSuccess]  = useState("");

  const roleColor: Record<UserRole, string> = {
    admin:  "#3b82f6",
    viewer: "#22c55e",
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    if (!username || !password) { setError("All fields required"); return; }
    setCreating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ username, password, role: "viewer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Viewer ${username} created successfully`);
      setUsername(""); setPassword("");
      fetchUsers();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/auth/users/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchUsers();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ width: "560px", background: "#0d1117", border: "1px solid #21262d", borderRadius: "8px", overflow: "hidden", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#e6edf3", letterSpacing: "0.1em" }}>USER MANAGEMENT</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px" }}>×</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>

          {/* Create viewer form — admin only */}
          {currentUser.role === "admin" && (
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "6px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "12px" }}>
                CREATE VIEWER
              </div>

              {error && (
                <div style={{ background: "#2d1a00", border: "1px solid #ff7700", borderRadius: "4px", color: "#ff9944", padding: "8px 12px", fontSize: "12px", marginBottom: "12px" }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ background: "#0d2010", border: "1px solid #22c55e", borderRadius: "4px", color: "#22c55e", padding: "8px 12px", fontSize: "12px", marginBottom: "12px" }}>
                  {success}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", display: "block", marginBottom: "4px" }}>USERNAME</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #21262d", borderRadius: "4px", padding: "6px 8px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
                    onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", display: "block", marginBottom: "4px" }}>PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #21262d", borderRadius: "4px", padding: "6px 8px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
                    onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                style={{ background: "#1d3250", border: "1px solid #3b82f6", borderRadius: "4px", color: "#3b82f6", padding: "7px 16px", fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.1em", cursor: creating ? "default" : "pointer", fontWeight: 700 }}
              >
                {creating ? "CREATING..." : "+ CREATE VIEWER"}
              </button>
            </div>
          )}

          {/* Users list */}
          <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "10px" }}>
            ALL USERS ({users.length})
          </div>

          {loading ? (
            <div style={{ color: "#555", fontFamily: "monospace", fontSize: "12px" }}>Loading...</div>
          ) : (
            users.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "#161b22", borderRadius: "4px", marginBottom: "6px", border: "1px solid #21262d" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: roleColor[u.role], flexShrink: 0 }} />

                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#c9d1d9", flex: 1 }}>
                  {u.username}
                </span>

                <span style={{ fontSize: "10px", fontFamily: "monospace", color: roleColor[u.role], background: `${roleColor[u.role]}15`, padding: "2px 8px", borderRadius: "3px", border: `1px solid ${roleColor[u.role]}33` }}>
                  {u.role.toUpperCase()}
                </span>

                <span style={{ fontSize: "10px", color: "#444", fontFamily: "monospace" }}>
                  {u.createdBy ? `by ${u.createdBy}` : "root"}
                </span>

                {/* Delete — admin only, can't delete other admins */}
                {currentUser.role === "admin" && u.role === "viewer" && (
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    style={{ background: "none", border: "1px solid #21262d", borderRadius: "3px", color: "#555", padding: "2px 8px", fontSize: "10px", fontFamily: "monospace", cursor: "pointer" }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#ff7700"; (e.target as HTMLElement).style.color = "#ff9944"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#21262d"; (e.target as HTMLElement).style.color = "#555"; }}
                  >
                    DELETE
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
    
  );
}