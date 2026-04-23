import { useState, useEffect } from "react";
import { login }               from "../lib/api";
import type { User }           from "../types";

function BootstrapForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) { setError("Both fields required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/auth/bootstrap", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", background: "#010409", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ width: "340px", background: "#0d1117", border: "1px solid #21262d", borderRadius: "8px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }} />
          <span style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#e6edf3" }}>LOGSTREAM</span>
        </div>

        <div style={{ fontSize: "11px", color: "#f59e0b", letterSpacing: "0.1em", marginBottom: "6px" }}>FIRST TIME SETUP</div>
        <div style={{ fontSize: "11px", color: "#555", marginBottom: "20px" }}>Create your superadmin account</div>

        {error && (
          <div style={{ background: "#2d1a00", border: "1px solid #ff7700", borderRadius: "4px", color: "#ff9944", padding: "8px 12px", fontSize: "12px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>USERNAME</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", background: "#161b22", border: "1px solid #21262d", borderRadius: "4px", padding: "8px 10px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#f59e0b"; }}
            onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", background: "#161b22", border: "1px solid #21262d", borderRadius: "4px", padding: "8px 10px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#f59e0b"; }}
            onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: "#2d1f00", border: "1px solid #f59e0b", borderRadius: "4px", color: "#f59e0b", padding: "10px", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.1em", cursor: loading ? "default" : "pointer", fontWeight: 700 }}
        >
          {loading ? "CREATING..." : "CREATE ADMIN"}
        </button>
      </div>
    </div>
  );
}

export function LoginPage({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [bootstrapped, setBootstrapped] = useState<boolean | null>(null);
  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  // Check if system is bootstrapped on mount
  useEffect(() => {
    fetch("/auth/status")
      .then(r => r.json())
      .then(d => setBootstrapped(d.bootstrapped))
      .catch(() => setBootstrapped(true)); // assume bootstrapped on error
  }, []);

  const handleSubmit = async () => {
    if (!username || !password) { setError("Both fields required"); return; }
    setLoading(true); setError("");
    try {
      const res = await login(username, password);
      onLogin(res.user, res.token);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (bootstrapped === null) {
    return (
      <div style={{ height: "100vh", background: "#010409", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "monospace", fontSize: "12px" }}>
        LOADING...
      </div>
    );
  }

  // Show bootstrap form if no users exist
  if (!bootstrapped) {
    return <BootstrapForm onDone={() => setBootstrapped(true)} />;
  }

  return (
    <div style={{ height: "100vh", background: "#010409", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ width: "320px", background: "#0d1117", border: "1px solid #21262d", borderRadius: "8px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 6px #3b82f6" }} />
          <span style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#e6edf3" }}>LOGSTREAM</span>
        </div>

        <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", marginBottom: "20px" }}>SIGN IN</div>

        {error && (
          <div style={{ background: "#2d1a00", border: "1px solid #ff7700", borderRadius: "4px", color: "#ff9944", padding: "8px 12px", fontSize: "12px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>USERNAME</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", background: "#161b22", border: "1px solid #21262d", borderRadius: "4px", padding: "8px 10px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", background: "#161b22", border: "1px solid #21262d", borderRadius: "4px", padding: "8px 10px", color: "#c9d1d9", fontFamily: "monospace", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={e  => { e.target.style.borderColor = "#21262d"; }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: "#1d3250", border: "1px solid #3b82f6", borderRadius: "4px", color: "#3b82f6", padding: "10px", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.1em", cursor: loading ? "default" : "pointer", fontWeight: 700 }}
        >
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </div>
    </div>
  );
}