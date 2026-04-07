"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { MapPin, Star, Calendar, MessageCircle, Shield, Zap, Stethoscope, Sparkles, Globe2, Phone } from "lucide-react";

/* ─── INTERACTIVE GLOBE ─── */
function InteractiveGlobe({ onExplore }) {
  const canvasRef = useRef(null);
  const [popup, setPopup] = useState(null);

  const NAMES = [
    { name: "Dr. Priya Sharma", loc: "Delhi", spec: "Cosmetic", lat: 28.63, lng: 77.22 },
    { name: "Dr. Arjun Mehta", loc: "Mumbai", spec: "Orthodontics", lat: 19.08, lng: 72.88 },
    { name: "Dr. Sneha Gupta", loc: "Bangalore", spec: "Pediatric", lat: 12.97, lng: 77.59 },
    { name: "Dr. Rahul Verma", loc: "Kolkata", spec: "Oral Surgery", lat: 22.57, lng: 88.36 },
    { name: "Dr. Kavya Nair", loc: "Chennai", spec: "Periodontics", lat: 13.08, lng: 80.27 },
    { name: "Dr. Vikram Singh", loc: "Jaipur", spec: "Endodontics", lat: 26.91, lng: 75.79 },
    { name: "Dr. Meera Joshi", loc: "Pune", spec: "General", lat: 18.52, lng: 73.86 },
    { name: "Dr. Aditya Rao", loc: "Hyderabad", spec: "Implants", lat: 17.39, lng: 78.49 },
    { name: "Dr. Ananya Kapoor", loc: "Lucknow", spec: "Cosmetic", lat: 26.85, lng: 80.95 },
    { name: "Dr. Rohit Patel", loc: "Ahmedabad", spec: "General", lat: 23.02, lng: 72.57 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let rotation = -1.2; // Start facing India
    const w = 440, h = 440;
    canvas.width = w; canvas.height = h;

    const dots = [];
    for (let lat = -85; lat <= 85; lat += 7) {
      for (let lng = -180; lng <= 180; lng += 7) {
        dots.push({ lat: lat * Math.PI / 180, lng: lng * Math.PI / 180 });
      }
    }

    const markers = NAMES.map(d => ({
      ...d, lat: d.lat * Math.PI / 180, lng: d.lng * Math.PI / 180,
    }));

    let popupTimer = 0;
    let currentPopupIdx = -1;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, r = 175;

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.5);
      glow.addColorStop(0, "rgba(124,58,237,0.06)");
      glow.addColorStop(0.5, "rgba(45,212,191,0.03)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(124,58,237,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner fill
      const inner = ctx.createRadialGradient(cx - 30, cy - 30, 0, cx, cy, r);
      inner.addColorStop(0, "rgba(124,58,237,0.04)");
      inner.addColorStop(1, "rgba(7,7,15,0.5)");
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Grid dots
      dots.forEach(d => {
        const x3d = r * Math.cos(d.lat) * Math.sin(d.lng + rotation);
        const z3d = r * Math.cos(d.lat) * Math.cos(d.lng + rotation);
        const y3d = r * Math.sin(d.lat);
        if (z3d < -10) return;
        const depth = (z3d + r) / (2 * r);
        const sx = cx + x3d;
        const sy = cy - y3d;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6 + depth * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,85,247,${0.08 + depth * 0.2})`;
        ctx.fill();
      });

      // Marker dots with popups
      markers.forEach((m, idx) => {
        const x3d = r * Math.cos(m.lat) * Math.sin(m.lng + rotation);
        const z3d = r * Math.cos(m.lat) * Math.cos(m.lng + rotation);
        const y3d = r * Math.sin(m.lat);
        if (z3d < 0) return;
        const sx = cx + x3d;
        const sy = cy - y3d;

        // Pulse ring
        const pulse = 4 + Math.sin(Date.now() / 600 + idx) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(45,212,191,0.15)";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#2dd4bf";
        ctx.fill();

        // Popup label for active marker
        if (idx === currentPopupIdx && z3d > r * 0.3) {
          // Line
          ctx.beginPath();
          ctx.moveTo(sx, sy - 5);
          ctx.lineTo(sx, sy - 22);
          ctx.strokeStyle = "rgba(45,212,191,0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Popup card
          const pw = 140, ph = 36;
          const px = sx - pw / 2, py = sy - 22 - ph;
          ctx.fillStyle = "rgba(20,20,40,0.85)";
          ctx.strokeStyle = "rgba(45,212,191,0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 8);
          ctx.fill();
          ctx.stroke();

          ctx.font = "bold 10px -apple-system, sans-serif";
          ctx.fillStyle = "#f0f0f5";
          ctx.fillText(m.name.length > 18 ? m.name.slice(0, 18) + "…" : m.name, px + 8, py + 14);
          ctx.font = "9px -apple-system, sans-serif";
          ctx.fillStyle = "#2dd4bf";
          ctx.fillText(`${m.spec} · ${m.loc}`, px + 8, py + 27);
        }
      });

      // Rotate popup every 2.5 seconds
      popupTimer++;
      if (popupTimer > 150) {
        popupTimer = 0;
        const visible = markers.filter((m) => {
          const z = r * Math.cos(m.lat) * Math.cos(m.lng + rotation);
          return z > r * 0.3;
        });
        if (visible.length > 0) {
          const pick = visible[Math.floor(Math.random() * visible.length)];
          currentPopupIdx = markers.indexOf(pick);
        }
      }

      rotation += 0.002;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={onExplore}>
      <canvas ref={canvasRef} style={{ display: "block", width: "min(350px, 80vw)", height: "min(350px, 80vw)", border: "none", outline: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-full)", padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
        <Globe2 size={12} color="var(--teal-400)" /> Click to explore map
      </div>
    </div>
  );
}

const stats = [{ v: "1,200+", l: "Verified Dentists" }, { v: "98%", l: "Happy Patients" }, { v: "4.8★", l: "Average Rating" }, { v: "50K+", l: "Appointments" }];
const features = [
  { icon: <MapPin size={22} />, t: "Find Nearby", d: "Real dentist clinics near you from OpenStreetMap data.", color: "#60a5fa" },
  { icon: <MessageCircle size={22} />, t: "Chat First", d: "Message any dentist directly before committing to a visit.", color: "#2dd4bf" },
  { icon: <Calendar size={22} />, t: "Book Instantly", d: "Real-time slot availability. Book with just a few taps.", color: "#c084fc" },
  { icon: <Star size={22} />, t: "Real Reviews", d: "Read verified reviews from real patients. No fake ratings.", color: "#fbbf24" },
  { icon: <Shield size={22} />, t: "Verified Docs", d: "Every dentist is credential-verified and trusted.", color: "#4ade80" },
  { icon: <Zap size={22} />, t: "Clear Pricing", d: "See consultation fees upfront. No surprises.", color: "#f472b6" },
];
const steps = [
  { n: "01", t: "Search & Filter", d: "We detect your location. Find real dental clinics nearby." },
  { n: "02", t: "Compare & Chat", d: "View profiles, read reviews, and chat with the dentist directly." },
  { n: "03", t: "Book & Visit", d: "Select your slot, confirm, and show up. Doctors get notified instantly." },
];

export default function LandingPage({ onAuth, onExploreMap, userLocation }) {
  useEffect(() => {
    const h = (e) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div className="mouse-glow" />
      <nav className="navbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="navbar-brand">
          <div className="navbar-logo"><Stethoscope size={18} color="#fff" /></div>
          <span className="navbar-title">DentaFind</span>
        </div>
        <div className="navbar-actions">
          <button className="btn-ghost hide-mobile" onClick={onAuth}>Log In</button>
          <button className="btn-primary" onClick={onAuth}><span>Get Started</span></button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "var(--gradient-hero)", padding: "130px 24px 70px", position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, background: "radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 60%)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
        <div className="hero-flex" style={{ display: "flex", alignItems: "center", gap: 60, maxWidth: 1100, margin: "0 auto", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          <div style={{ flex: 1, minWidth: 320, textAlign: "left", position: "relative", zIndex: 1 }}>
            <div className="animate-fade" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 999, padding: "6px 16px", marginBottom: 24, fontSize: 12, color: "var(--teal-400)", fontWeight: 700 }}>
              <Sparkles size={12} /> {userLocation ? "📍 Location detected" : "Now available in India"}
            </div>
            <h1 className="animate-slide-up" style={{ margin: "0 0 20px", fontSize: "clamp(36px,5.5vw,60px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px" }}>
              Find <span style={{ color: "var(--teal-400)" }}>real dentists</span>,<br />
              <span style={{ background: "var(--gradient-purple)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>right around<br />the corner</span>
            </h1>
            <p className="animate-fade" style={{ animationDelay: "0.15s", margin: "0 0 36px", fontSize: 17, color: "var(--text-secondary)", maxWidth: 440, lineHeight: 1.75 }}>
              We find real dental clinics near you using live map data. Browse, chat, and book — all in one place.
            </p>
            <div className="animate-fade" style={{ animationDelay: "0.25s", display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={onAuth} className="btn-accent" style={{ padding: "16px 36px", fontSize: 15 }}>Get Started Free →</button>
              <button onClick={onExploreMap} className="btn-primary" style={{ padding: "16px 28px", fontSize: 15 }}><span><Globe2 size={16} /> Explore Map</span></button>
            </div>
          </div>
          <div className="animate-scale hide-mobile" style={{ animationDelay: "0.3s" }}>
            <div className="animate-float">
              <InteractiveGlobe onExplore={onExploreMap} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "36px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 56, maxWidth: 800, margin: "0 auto" }}>
          {stats.map((s, i) => (
            <div key={i} className="animate-fade" style={{ animationDelay: `${i * 0.1}s`, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 34, fontWeight: 900, background: "linear-gradient(135deg,#fff 0%,var(--teal-400) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.v}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: "var(--bg-primary)" }}>
        <div className="container">
          <p className="section-title">How It Works</p>
          <h2 className="section-heading">Three steps to a healthier smile</h2>
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {steps.map((s, i) => (
              <div key={i} className="glass-card animate-card" style={{ padding: "36px 28px" }}>
                <p style={{ margin: "0 0 14px", fontSize: 52, fontWeight: 900, background: "var(--gradient-purple)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{s.n}</p>
                <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>{s.t}</p>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <p className="section-title">Why DentaFind</p>
          <h2 className="section-heading">Everything you need, nothing you don't</h2>
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="glass-card animate-card" style={{ padding: "24px 22px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: `${f.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, flexShrink: 0, border: `1px solid ${f.color}20` }}>{f.icon}</div>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800 }}>{f.t}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: "var(--bg-primary)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 50%)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, letterSpacing: "-1px" }}>Start your smile journey today</h2>
          <p style={{ margin: "0 auto 36px", fontSize: 16, color: "var(--text-secondary)", maxWidth: 420 }}>Join 50,000+ patients who found their perfect dentist.</p>
          <button onClick={onAuth} className="btn-accent" style={{ padding: "18px 44px", fontSize: 16 }}>Get Started for Free →</button>
        </div>
      </section>

      <footer style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <div className="navbar-logo" style={{ padding: "5px 7px" }}><Stethoscope size={14} color="#fff" /></div>
          <span style={{ fontSize: 16, fontWeight: 900 }}>DentaFind</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>© 2025 DentaFind · Real dental clinics powered by OpenStreetMap</p>
      </footer>
    </div>
  );
}
