"use client";
import { useState, useEffect } from "react";
import { Home, Map, Calendar, MessageCircle, User, Stethoscope, LayoutDashboard, LogOut, Settings } from "lucide-react";
import HomePage from "./HomePage";
import MapPage from "./MapPage";
import ProfilePage from "./ProfilePage";
import BookingPage from "./BookingPage";
import ChatPage from "./ChatPage";
import AppointmentsPage from "./AppointmentsPage";
import DoctorDashboard from "./DoctorDashboard";
import { Avatar } from "./Shared";

const PATIENT_NAV = [
  { id: "home", icon: <Home size={18} />, label: "Home" },
  { id: "map", icon: <Map size={18} />, label: "Map View" },
  { id: "appointments", icon: <Calendar size={18} />, label: "Appointments" },
  { id: "chat-list", icon: <MessageCircle size={18} />, label: "Messages" },
];
const DOCTOR_NAV = [
  { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { id: "appointments", icon: <Calendar size={18} />, label: "Appointments" },
  { id: "chat-list", icon: <MessageCircle size={18} />, label: "Messages" },
];

export default function MainApp({ user, onLogout, userLocation }) {
  const isDoc = user.role === "doctor";
  const [page, setPage] = useState(isDoc ? "dashboard" : "home");
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navItems = isDoc ? DOCTOR_NAV : PATIENT_NAV;

  useEffect(() => {
    fetch("/api/dentists").then(r => r.json()).then(setDentists).catch(() => {});
    pollAppointments();
    const iv = setInterval(pollAppointments, 8000);
    return () => clearInterval(iv);
  }, [user]);

  const pollAppointments = () => {
    if (user.id) fetch(`/api/appointments?userId=${user.id}&role=${user.role}`)
      .then(r => r.json()).then(setAppointments).catch(() => {});
  };

  useEffect(() => {
    const h = (e) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const goProfile = (d) => { setSelectedDentist(d); setPage("profile"); };
  const goBook = (d) => { setSelectedDentist(d); setPage("booking"); };
  const goChat = (d) => { setSelectedDentist(d); setPage("chat"); };
  const onBookConfirm = (apt) => { setAppointments(prev => [apt, ...prev]); setPage("appointments"); };

  const isOverlay = ["profile", "booking", "chat"].includes(page);

  const renderContent = () => {
    if (page === "dashboard" && isDoc) return <DoctorDashboard user={user} appointments={appointments} onLogout={onLogout} onChat={goChat} />;
    if (page === "home") return <HomePage user={user} dentists={dentists} appointments={appointments} onProfile={goProfile} onBook={goBook} onMap={() => setPage("map")} />;
    if (page === "map") return <MapPage dentists={dentists} onProfile={goProfile} onBack={() => setPage("home")} userLocation={userLocation} />;
    if (page === "appointments") return <AppointmentsPage appointments={appointments} onBack={() => setPage("home")} onChat={goChat} onProfile={goProfile} />;
    if (page === "chat-list") return <AppointmentsPage appointments={appointments} onBack={() => setPage("home")} onChat={goChat} onProfile={goProfile} chatMode />;
    if (page === "profile" && selectedDentist) return <ProfilePage d={selectedDentist} onBook={() => goBook(selectedDentist)} onChat={() => goChat(selectedDentist)} onBack={() => setPage("home")} />;
    if (page === "booking" && selectedDentist) return <BookingPage d={selectedDentist} user={user} onConfirm={onBookConfirm} onBack={() => setPage("profile")} />;
    if (page === "chat" && selectedDentist) return <ChatPage d={selectedDentist} user={user} onBack={() => setPage("profile")} />;
    return null;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>
      <div className="mouse-glow" />
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <div className="navbar-logo" style={{ padding: "5px 7px" }}><Stethoscope size={14} color="#fff" /></div>
          <span style={{ fontSize: 16, fontWeight: 900 }}>DentaFind</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", padding: "8px 14px 6px", textTransform: "uppercase", letterSpacing: "1px" }}>
          {isDoc ? "Doctor" : "Patient"}
        </div>
        {navItems.map(item => (
          <div key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            {item.icon}
            <span>{item.label}</span>
            {item.id === "appointments" && appointments.length > 0 && (
              <span style={{ marginLeft: "auto", background: "rgba(124,58,237,0.2)", color: "var(--purple-300)", fontSize: 10, fontWeight: 800, borderRadius: "var(--radius-full)", padding: "2px 7px" }}>
                {appointments.length}
              </span>
            )}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 8 }}>
            <Avatar name={user.name} size={32} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>
          <div className="sidebar-item" onClick={onLogout}>
            <LogOut size={16} /><span>Log Out</span>
          </div>
        </div>
      </aside>
      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {renderContent()}
      </main>
    </div>
  );
}
