"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Stethoscope, User } from "lucide-react";

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function GitHubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>;
}

export default function AuthPage({ onLogin, onBack }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.style.setProperty("--mx", "50%");
    document.documentElement.style.setProperty("--my", "50%");
    const h = (e) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (tab === "signup" && !form.name) return setError("Name is required");
    if (!form.email) return setError("Email is required");
    if (!form.password) return setError("Password is required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      if (tab === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
      }
      onLogin({ name: form.name || form.email.split("@")[0], email: form.email, role: tab === "signup" ? role : "patient", id: Date.now().toString() });
    } catch { setError("Connection error."); }
    setLoading(false);
  };

  const handleOAuth = (provider) => {
    window.location.href = `/api/auth/signin/${provider}`;
  };

  const inputStyle = { width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px", fontSize: 14, color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-primary)", boxSizing: "border-box", transition: "all 0.25s" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div className="mouse-glow" />
      <div style={{ position: "absolute", top: "15%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 60%)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      <div className="animate-scale" style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div className="navbar-logo"><Stethoscope size={20} color="#fff" /></div>
            <span style={{ fontSize: 24, fontWeight: 900 }}>DentaFind</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>Your dental health companion</p>
        </div>

        <div className="glass-card" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            {["login", "signup"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{ flex: 1, padding: 16, border: "none", background: tab === t ? "rgba(124,58,237,0.08)" : "transparent", color: tab === t ? "var(--purple-400)" : "var(--text-muted)", fontWeight: tab === t ? 800 : 500, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-primary)", transition: "all 0.2s", borderBottom: tab === t ? "2px solid var(--purple-500)" : "2px solid transparent" }}>
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px 28px 32px" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--text-muted)" }}>
              {tab === "login" ? "Log in to find and book dentists." : "Join 50,000+ patients on DentaFind."}
            </p>

            {/* OAuth buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button onClick={() => handleOAuth("google")} className="btn-primary" style={{ flex: 1, padding: 13, fontSize: 13 }}>
                <GoogleIcon /> <span>Google</span>
              </button>
              <button onClick={() => handleOAuth("github")} className="btn-primary" style={{ flex: 1, padding: 13, fontSize: 13 }}>
                <GitHubIcon /> <span>GitHub</span>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Role selector (signup) */}
            {tab === "signup" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>I am a</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ val: "patient", icon: <User size={16} />, label: "Patient" }, { val: "doctor", icon: <Stethoscope size={16} />, label: "Doctor" }].map(r => (
                    <button key={r.val} onClick={() => setRole(r.val)}
                      style={{ flex: 1, padding: "12px 14px", borderRadius: "var(--radius-lg)", border: role === r.val ? "1.5px solid var(--purple-500)" : "1.5px solid var(--border)", background: role === r.val ? "rgba(124,58,237,0.12)" : "var(--bg-input)", color: role === r.val ? "var(--purple-300)" : "var(--text-secondary)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-primary)", transition: "all 0.2s" }}>
                      {r.icon} {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Priya Sharma" style={inputStyle} />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inputStyle} />
            </div>
            {tab === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" style={inputStyle} />
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={inputStyle} />
            </div>

            {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#f87171" }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading} className="btn-accent" style={{ width: "100%", padding: 14, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={16} className="spin" />}
              {tab === "login" ? "Log In" : "Create Account"}
            </button>
          </div>
        </div>

        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, margin: "22px auto 0", background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-primary)" }}>
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
    </div>
  );
}
