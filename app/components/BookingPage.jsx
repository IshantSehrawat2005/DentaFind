"use client";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Stethoscope } from "lucide-react";

const SLOTS = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"];

export default function BookingPage({ d, user, onConfirm, onBack }) {
  const today = new Date();
  const [selDate, setSelDate] = useState(null);
  const [selSlot, setSelSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const getDays = () => Array.from({ length: 14 }, (_, i) => { const dt = new Date(today); dt.setDate(today.getDate() + i); return dt; });
  const fmtDate = dt => dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const unavail = [SLOTS[2], SLOTS[5], SLOTS[9]];

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const apt = {
        patientId: user.id, patientName: user.name,
        doctorId: d._id, doctorName: d.name, doctorSpecialty: d.specialty,
        doctorClinic: d.clinic, doctorLocation: d.location?.address || d.loc,
        date: fmtDate(selDate), slot: selSlot, reason,
      };
      const res = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apt),
      });
      const data = await res.json();
      onConfirm(data);
    } catch { onConfirm({ dentist: d, date: fmtDate(selDate), slot: selSlot, reason, doctorName: d.name, doctorSpecialty: d.specialty, doctorClinic: d.clinic }); }
    setLoading(false);
  };

  if (step === 3) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "2px solid rgba(124,58,237,0.3)" }}>
            <CheckCircle size={40} color="var(--purple-400)" />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>Booked!</h2>
          <p style={{ margin: "0 0 28px", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Your appointment with <strong style={{ color: "var(--text-primary)" }}>{d.name}</strong> is confirmed for <strong style={{ color: "var(--text-primary)" }}>{fmtDate(selDate)}</strong> at <strong style={{ color: "var(--text-primary)" }}>{selSlot}</strong>.
          </p>
          <button onClick={confirmBooking} disabled={loading} className="btn-primary" style={{ width: "100%", padding: 15, fontSize: 15, borderRadius: "var(--radius-md)", opacity: loading ? 0.7 : 1 }}>
            <span>{loading ? "Saving..." : "View My Appointments"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <nav className="navbar">
        <button className="btn-secondary" onClick={onBack} style={{ padding: "8px 14px", fontSize: 12, borderRadius: "var(--radius-sm)" }}><ArrowLeft size={14} /> Back</button>
        <span style={{ fontSize: 16, fontWeight: 900 }}>Book Appointment</span>
        <div />
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {/* Doctor banner */}
        <div className="glass-card" style={{ padding: 18, marginBottom: 24, borderRadius: "var(--radius-lg)", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={22} color="var(--purple-400)" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{d.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--purple-400)" }}>{d.specialty} · ₹{d.fee}</p>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>Select a Date</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>Pick your preferred date</p>
            <div style={{ display: "flex", overflowX: "auto", gap: 10, paddingBottom: 8, marginBottom: 28 }}>
              {getDays().map((dt, i) => {
                const sel = selDate?.toDateString() === dt.toDateString();
                return (
                  <button key={i} onClick={() => setSelDate(dt)}
                    style={{ flexShrink: 0, background: sel ? "var(--gradient-btn)" : "var(--bg-card)", border: `1.5px solid ${sel ? "var(--purple-500)" : "var(--border)"}`, borderRadius: "var(--radius-md)", padding: "12px 16px", cursor: "pointer", textAlign: "center", fontFamily: "var(--font-primary)", transition: "all 0.15s" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: sel ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>{dt.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: sel ? "#fff" : "var(--text-primary)" }}>{dt.getDate()}</p>
                  </button>
                );
              })}
            </div>

            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>Select Time</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>Available slots{selDate ? ` for ${fmtDate(selDate)}` : ""}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", gap: 10 }}>
              {SLOTS.map(sl => {
                const sel = selSlot === sl;
                const un = unavail.includes(sl);
                return (
                  <button key={sl} disabled={un} onClick={() => setSelSlot(sl)}
                    style={{ background: sel ? "var(--gradient-btn)" : un ? "var(--bg-card)" : "var(--bg-input)", border: `1.5px solid ${sel ? "var(--purple-500)" : "var(--border)"}`, borderRadius: "var(--radius-md)", padding: "10px", fontSize: 12, fontWeight: 700, color: sel ? "#fff" : un ? "var(--text-muted)" : "var(--text-secondary)", cursor: un ? "not-allowed" : "pointer", fontFamily: "var(--font-primary)", opacity: un ? 0.4 : 1, textDecoration: un ? "line-through" : "none", transition: "all 0.15s" }}>
                    {sl}
                  </button>
                );
              })}
            </div>

            <button disabled={!selDate || !selSlot} onClick={() => setStep(2)} className="btn-primary"
              style={{ width: "100%", marginTop: 28, padding: 15, fontSize: 15, borderRadius: "var(--radius-md)", opacity: (!selDate || !selSlot) ? 0.4 : 1 }}>
              <span>Continue →</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>Summary</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>Review before confirming</p>
            <div className="glass-card" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 20 }}>
              {[
                { l: "Date", v: fmtDate(selDate) }, { l: "Time", v: selSlot },
                { l: "Doctor", v: d.name }, { l: "Specialty", v: d.specialty },
                { l: "Clinic", v: d.clinic }, { l: "Fee", v: `₹${d.fee}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{row.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{row.v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Reason (optional)</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Tooth pain, checkup…" rows={3} className="textarea" />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: 14, fontSize: 14, borderRadius: "var(--radius-md)" }}>← Edit</button>
              <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 2, padding: 14, fontSize: 14, borderRadius: "var(--radius-md)" }}><span>Confirm ✓</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
