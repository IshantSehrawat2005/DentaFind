"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Calendar, MessageCircle, Shield, Award, CheckCircle, Phone, ExternalLink } from "lucide-react";
import { Stars, Avatar } from "./Shared";

export default function ProfilePage({ d, onBook, onChat, onBack }) {
  const [tab, setTab] = useState("about");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`/api/dentists?id=${d._id}`).then(r => r.json()).then(data => {
      if (data.reviews) setReviews(data.reviews);
    }).catch(() => {});
  }, [d._id]);

  const bg = d.bgColor || "#c084fc";
  const infoCards = [
    { icon: <Clock size={16} color="var(--teal-400)" />, l: "Next Available", v: d.nextSlot || "Contact", c: "var(--teal-400)" },
    { icon: <span style={{ fontSize: 16, color: "var(--blue-400)" }}>₹</span>, l: "Fee", v: `₹${d.fee}`, c: "var(--text-primary)" },
    { icon: <Award size={16} color="var(--purple-400)" />, l: "Experience", v: d.experience, c: "var(--text-primary)" },
    { icon: <Clock size={16} color="var(--text-muted)" />, l: "Hours", v: d.openHours?.split(",")[1]?.trim() || "10–7 PM", c: "var(--text-primary)" },
  ];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg,${bg}0a 0%,${bg}05 100%)`, borderBottom: "1px solid var(--border)" }}>
        <div style={{ padding: "12px 24px" }}>
          <button className="btn-secondary" onClick={onBack} style={{ padding: "8px 14px", fontSize: 12 }}><ArrowLeft size={14} /> Back</button>
        </div>
        <div className="animate-fade" style={{ padding: "0 28px 28px", display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: "var(--radius-lg)", background: `${bg}25`, overflow: "hidden", border: "1.5px solid var(--border)", flexShrink: 0 }}>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${d.name?.split(" ")[1] || "d"}&backgroundColor=${bg.replace("#","")}`} alt="" style={{ width: "100%", height: "100%" }} onError={e => e.target.style.display="none"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px" }}>{d.name}</h1>
              {d.verified && <span className="badge badge-green"><Shield size={10} /> Verified</span>}
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--purple-400)", fontWeight: 700 }}>{d.specialty} · {d.clinic}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Stars v={d.rating} size={14} /><span style={{ fontSize: 14, fontWeight: 800 }}>{d.rating}</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>({d.reviewCount || reviews.length})</span></div>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}><MapPin size={11} /> {d.location?.address}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {d.phone && <a href={`tel:${d.phone}`} className="btn-primary" style={{ padding: "10px 16px", fontSize: 13 }}><Phone size={15} /> <span>Call</span></a>}
            <button className="btn-primary" onClick={onChat} style={{ padding: "10px 18px", fontSize: 13 }}><span><MessageCircle size={15} /> Chat</span></button>
            <button className="btn-accent" onClick={onBook} style={{ padding: "10px 22px", fontSize: 13 }}><Calendar size={15} /> Book</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 24 }}>
          {infoCards.map((it, i) => (
            <div key={i} className="glass-card animate-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>{it.icon}<span style={{ fontSize: 11, color: "var(--text-muted)" }}>{it.l}</span></div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: it.c }}>{it.v}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          {["about","services","reviews"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "12px 24px", border: "none", borderBottom: tab === t ? "2px solid var(--purple-500)" : "2px solid transparent", background: "transparent", fontSize: 14, fontWeight: tab === t ? 800 : 500, color: tab === t ? "var(--purple-400)" : "var(--text-muted)", cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--font-primary)" }}>
              {t}
            </button>
          ))}
        </div>

        {tab === "about" && (
          <div className="animate-fade">
            <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 900 }}>About {d.name}</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>{d.about}</p>
            <div className="glass-card" style={{ padding: "20px 22px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Education & Qualifications</h4>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={14} color="var(--teal-400)" /> {d.education}</p>
            </div>
          </div>
        )}
        {tab === "services" && (
          <div className="animate-fade">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 900 }}>Services Offered</h3>
            <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {(d.services || []).map((s, i) => (
                <div key={i} className="glass-card animate-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal-400)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "reviews" && (
          <div className="animate-fade stagger" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reviews.length > 0 ? reviews.map((r, i) => (
              <div key={i} className="glass-card animate-card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Avatar name={r.patientName} size={34} />
                    <div><p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>{r.patientName}</p><p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{r.createdAt}</p></div>
                  </div>
                  <Stars v={r.rating} size={13} />
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{r.text}</p>
              </div>
            )) : <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 40 }}>No reviews yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
