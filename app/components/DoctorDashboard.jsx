"use client";
import { useState, useEffect } from "react";
import { LogOut, Stethoscope, Calendar, MessageCircle, Save, Plus, X, MapPin, Loader2 } from "lucide-react";
import { Avatar } from "./Shared";

const SPECIALTIES = ["General Dentistry","Cosmetic Dentistry","Orthodontics","Pediatric Dentistry","Oral Surgery","Periodontics","Endodontics","Implantology","Prosthodontics"];

export default function DoctorDashboard({ user, appointments, onLogout, onChat }) {
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [profile, setProfile] = useState({
    name: user.name || "", specialty: "", clinic: "", education: "", experience: "",
    about: "", services: [], fee: 500, phone: user.phone || "", openHours: "Mon-Sat, 10 AM-6 PM",
    location: { address: "", lat: 28.6139, lng: 77.209 }, bgColor: "#c084fc",
    available: true, nextSlot: "Today 3:00 PM",
  });
  const [newService, setNewService] = useState("");

  // Load existing profile from DB
  useEffect(() => {
    if (user.id) {
      fetch(`/api/dentists?id=${user.id}`).then(r => r.json()).then(data => {
        if (data && !data.error) {
          setProfile(p => ({ ...p, ...data, location: data.location || p.location }));
        }
      }).catch(() => {});
    }
  }, [user.id]);

  const addService = () => { if (newService.trim()) { setProfile(p => ({ ...p, services: [...p.services, newService.trim()] })); setNewService(""); } };
  const removeService = (i) => setProfile(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));

  // Geocode address to lat/lng using free Nominatim API
  const geocodeAddress = async () => {
    if (!profile.location.address) return;
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.location.address)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        setProfile(p => ({ ...p, location: { ...p.location, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } }));
      }
    } catch {}
    setGeocoding(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    // Auto-geocode if no coordinates set
    if (profile.location.address && (!profile.location.lat || profile.location.lat === 28.6139)) {
      await geocodeAddress();
    }
    try {
      await fetch("/api/doctor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, userId: user.id, rating: profile.rating || 4.5, reviewCount: profile.reviewCount || 0 }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const is = { width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", padding: "13px 16px", fontSize: 14, color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-primary)", boxSizing: "border-box" };

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "28px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px" }}>Doctor Dashboard</h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Manage your profile and appointments</p>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
          {[["profile","Profile Setup"],["appointments","Appointments"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: "12px 24px", border: "none", borderBottom: tab === k ? "2px solid var(--purple-500)" : "2px solid transparent", background: "transparent", fontSize: 14, fontWeight: tab === k ? 800 : 500, color: tab === k ? "var(--purple-400)" : "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-primary)" }}>
              {l}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="animate-fade">
            {saved && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#4ade80", fontWeight: 700 }}>✓ Profile saved! Patients can now find and book you.</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name</label><input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={is} /></div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Phone</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" style={is} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Specialty</label>
                <select value={profile.specialty} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))} style={{ ...is, cursor: "pointer" }}>
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Experience</label><input value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. 8 yrs" style={is} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Clinic Name</label><input value={profile.clinic} onChange={e => setProfile(p => ({ ...p, clinic: e.target.value }))} style={is} /></div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Consultation Fee (₹)</label><input type="number" value={profile.fee} onChange={e => setProfile(p => ({ ...p, fee: parseInt(e.target.value) || 0 }))} style={is} /></div>
            </div>

            <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Education</label><input value={profile.education} onChange={e => setProfile(p => ({ ...p, education: e.target.value }))} placeholder="e.g. BDS, MDS – AIIMS Delhi" style={is} /></div>

            {/* Location with geocoding */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                <MapPin size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Clinic Address (patients will find you here)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={profile.location.address} onChange={e => setProfile(p => ({ ...p, location: { ...p.location, address: e.target.value } }))} placeholder="e.g. Connaught Place, New Delhi" style={{ ...is, flex: 1 }} />
                <button onClick={geocodeAddress} disabled={geocoding} className="btn-secondary" style={{ padding: "0 16px", borderRadius: "var(--radius-md)", whiteSpace: "nowrap" }}>
                  {geocoding ? <Loader2 size={14} className="spin" /> : "📍 Verify"}
                </button>
              </div>
              {profile.location.lat !== 28.6139 && (
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--teal-400)" }}>📍 Location set: {profile.location.lat.toFixed(4)}, {profile.location.lng.toFixed(4)}</p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Open Hours</label><input value={profile.openHours} onChange={e => setProfile(p => ({ ...p, openHours: e.target.value }))} style={is} /></div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Next Available Slot</label><input value={profile.nextSlot} onChange={e => setProfile(p => ({ ...p, nextSlot: e.target.value }))} placeholder="Today 3:00 PM" style={is} /></div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Currently Available</label>
                <button onClick={() => setProfile(p => ({ ...p, available: !p.available }))}
                  style={{ ...is, cursor: "pointer", textAlign: "center", fontWeight: 700, background: profile.available ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: profile.available ? "#4ade80" : "#f87171", borderColor: profile.available ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)" }}>
                  {profile.available ? "✓ Available" : "✕ Unavailable"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>About You</label><textarea value={profile.about} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} rows={4} placeholder="Tell patients about your practice…" className="textarea" /></div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Services</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {profile.services.map((s, i) => (
                  <span key={i} className="badge badge-purple" style={{ gap: 6 }}>{s} <button onClick={() => removeService(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple-300)", padding: 0, display: "flex" }}><X size={12} /></button></span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key === "Enter" && addService()} placeholder="Add a service" style={{ ...is, flex: 1 }} />
                <button onClick={addService} className="btn-secondary" style={{ padding: "0 16px", borderRadius: "var(--radius-md)" }}><Plus size={16} /></button>
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving} className="btn-accent" style={{ width: "100%", padding: 15, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Profile & Go Live</>}
            </button>
          </div>
        )}

        {tab === "appointments" && (
          <div className="animate-fade">
            <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900 }}>Incoming Appointments</h3>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--text-muted)" }}>Patients who booked with you will appear here in real-time</p>
            {appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <p style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>No appointments yet</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Complete your profile to start receiving bookings</p>
              </div>
            ) : (
              <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {appointments.map((ap, i) => (
                  <div key={i} className="glass-card animate-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--purple-300)" }}>📅 {ap.date} · {ap.slot}</span>
                      <span className="badge badge-green">Confirmed</span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800 }}>{ap.patientName}</p>
                    {ap.reason && <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-secondary)" }}>Reason: {ap.reason}</p>}
                    <button onClick={() => onChat && onChat({ _id: ap.patientId, name: ap.patientName })} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}><span><MessageCircle size={12} /> Reply</span></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
