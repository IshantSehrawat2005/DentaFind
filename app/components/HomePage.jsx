"use client";
import { useState } from "react";
import { Search, MapPin, X, Heart, Shield, Phone } from "lucide-react";
import { Stars, Avatar } from "./Shared";

const CATS = [
  { icon: "🦷", label: "General" }, { icon: "✨", label: "Cosmetic" }, { icon: "📐", label: "Orthodontics" },
  { icon: "👶", label: "Pediatric" }, { icon: "🔪", label: "Surgery" }, { icon: "🌿", label: "Periodontics" },
  { icon: "🔩", label: "Implants" }, { icon: "🔬", label: "Endodontics" },
];

function DentistCard({ d, onView, onBook, delay }) {
  const [liked, setLiked] = useState(false);
  const bg = d.bgColor || "#c084fc";
  return (
    <div className="dentist-card animate-card" style={{ animationDelay: `${delay}s`, opacity: 0 }} onClick={() => onView(d)}>
      <div className="dentist-card-header" style={{ background: `linear-gradient(135deg, ${bg}18 0%, ${bg}35 100%)` }}>
        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${d.name?.split(" ")[1] || "d"}&backgroundColor=${bg.replace("#","")}`} alt="" style={{ height: 100 }} onError={e => { e.target.style.display="none"; }} />
        <button onClick={e => { e.stopPropagation(); setLiked(!liked); }} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
          <Heart size={14} fill={liked ? "#f87171" : "none"} stroke={liked ? "#f87171" : "rgba(255,255,255,0.5)"} />
        </button>
        {d.badge && <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>{d.badge}</span>}
        {d.verified && <span style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", color: "var(--teal-400)", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(45,212,191,0.2)" }}><Shield size={9} /> Verified</span>}
      </div>
      <div className="dentist-card-body">
        <p className="dentist-card-name">{d.name}</p>
        <p className="dentist-card-specialty">{d.specialty}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Stars v={d.rating} size={12} />
          <span style={{ fontSize: 12, fontWeight: 800 }}>{d.rating}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({d.reviewCount || 0})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={11} color="var(--text-muted)" />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.location?.address || ""}</span>
        </div>
        <div className="dentist-card-footer">
          <div>
            <p style={{ margin: 0, fontSize: 10, color: "var(--text-muted)" }}>Next slot</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: d.available !== false ? "var(--teal-400)" : "#fbbf24" }}>{d.nextSlot || "Contact"}</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {d.phone && <a href={`tel:${d.phone}`} onClick={e => e.stopPropagation()} className="btn-primary" style={{ padding: "7px 12px", fontSize: 11 }}><Phone size={12} /></a>}
            <button onClick={e => { e.stopPropagation(); onBook(d); }} className="btn-accent" style={{ padding: "7px 16px", fontSize: 11, borderRadius: "var(--radius-full)" }}>Book</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ user, dentists, appointments, onProfile, onBook, onMap }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = dentists.filter(d => {
    const q = search.toLowerCase();
    const mS = !q || d.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q) || d.location?.address?.toLowerCase().includes(q);
    const mC = !cat || d.specialty?.toLowerCase().includes(cat.toLowerCase());
    const mF = filter === "all" || (filter === "available" && d.available !== false) || (filter === "toprated" && d.rating >= 4.8);
    return mS && mC && mF;
  });

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Search */}
      <div style={{ background: "var(--gradient-hero)", padding: "28px 24px 20px", position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 60%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="animate-fade" style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>Hello, {user.name?.split(" ")[0]} 👋</p>
          <p className="animate-fade" style={{ animationDelay: "0.1s", margin: "0 0 18px", fontSize: 14, color: "var(--text-secondary)" }}>Find the best dentist near you</p>
          <div className="glass animate-fade" style={{ animationDelay: "0.15s", display: "flex", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 18px" }}>
              <Search size={15} color="var(--text-muted)" style={{ marginRight: 10 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialty, location…" style={{ border: "none", outline: "none", fontSize: 14, color: "var(--text-primary)", background: "transparent", width: "100%", fontFamily: "var(--font-primary)", padding: "13px 0" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="var(--text-muted)" /></button>}
            </div>
            <button className="btn-accent" style={{ borderRadius: 0, padding: "0 24px", borderRadius: "0 var(--radius-full) var(--radius-full) 0" }}><Search size={15} color="#fff" /></button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 60px" }}>
        {/* Categories */}
        <div style={{ margin: "18px 0 0" }}>
          <div style={{ display: "flex", overflowX: "auto", gap: 8, paddingBottom: 8 }}>
            {CATS.map(c => (
              <button key={c.label} onClick={() => setCat(cat === c.label ? null : c.label)}
                style={{ flexShrink: 0, background: cat === c.label ? "rgba(124,58,237,0.1)" : "var(--bg-card)", border: `1px solid ${cat === c.label ? "var(--purple-600)" : "var(--border)"}`, borderRadius: "var(--radius-full)", padding: "8px 16px", fontSize: 12, fontWeight: 700, color: cat === c.label ? "var(--purple-300)" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-primary)", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 14px" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{filtered.length} dentists found</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all","All"],["available","Available"],["toprated","Top Rated"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                style={{ background: filter === v ? "rgba(124,58,237,0.12)" : "transparent", border: `1px solid ${filter === v ? "rgba(124,58,237,0.3)" : "var(--border)"}`, borderRadius: "var(--radius-full)", padding: "5px 14px", fontSize: 11, fontWeight: 700, color: filter === v ? "var(--purple-300)" : "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-primary)", transition: "all 0.2s" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 16 }}>
          {filtered.map((d, i) => <DentistCard key={d._id || i} d={d} onView={onProfile} onBook={onBook} delay={i * 0.07} />)}
        </div>
        {filtered.length === 0 && (
          <div className="animate-fade" style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 48, margin: "0 0 12px" }}>🦷</p>
            <p style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>No dentists found</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
