"use client";
import { MessageCircle, Stethoscope, Calendar, Phone } from "lucide-react";

export default function AppointmentsPage({ appointments, onBack, onChat, onProfile, chatMode }) {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "28px 24px" }}>
      <h2 className="animate-fade" style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px" }}>
        {chatMode ? "Messages" : "My Appointments"}
      </h2>
      <p className="animate-fade" style={{ animationDelay: "0.05s", margin: "0 0 24px", fontSize: 13, color: "var(--text-muted)" }}>
        {chatMode ? "Chat with your doctors" : "Manage your upcoming appointments"}
      </p>

      {appointments.length === 0 ? (
        <div className="animate-fade" style={{ textAlign: "center", padding: "80px 20px" }}>
          <p style={{ fontSize: 48, margin: "0 0 16px" }}>{chatMode ? "💬" : "📅"}</p>
          <p style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>{chatMode ? "No conversations yet" : "No appointments yet"}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 28px" }}>{chatMode ? "Book a dentist to start chatting" : "Browse dentists and book your first appointment"}</p>
        </div>
      ) : (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {appointments.map((ap, i) => (
            <div key={i} className="glass-card animate-card" style={{ overflow: "hidden" }}>
              {!chatMode && (
                <div style={{ background: "rgba(124,58,237,0.06)", padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--purple-300)" }}>📅 {ap.date} · {ap.slot}</span>
                  <span className="badge badge-green">Confirmed</span>
                </div>
              )}
              <div style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Stethoscope size={18} color="var(--purple-400)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800 }}>{ap.doctorName || ap.dentist?.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{ap.doctorSpecialty || ap.dentist?.specialty} · {ap.doctorClinic || ap.dentist?.clinic}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onChat && onChat({ _id: ap.doctorId, name: ap.doctorName, specialty: ap.doctorSpecialty, clinic: ap.doctorClinic, phone: ap.doctorPhone })} className="btn-primary" style={{ padding: "8px 14px", fontSize: 11 }}>
                    <span><MessageCircle size={12} /> {chatMode ? "Open" : "Chat"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
