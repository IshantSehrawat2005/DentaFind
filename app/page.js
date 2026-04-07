"use client";
import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import MainApp from "./components/MainApp";
import ExploreMap from "./components/ExploreMap";

export default function Page() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dentafind_user");
    if (saved) {
      try { const u = JSON.parse(saved); setUser(u); setView("app"); } catch {}
    }
    // Ask for location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 28.6139, lng: 77.209 }), // Default Delhi
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.209 });
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem("dentafind_user", JSON.stringify(u));
    setView("app");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("dentafind_user");
    setView("landing");
  };

  const handleExploreMap = () => setView("explore");
  const handleAuthGate = () => setShowAuthPopup(true);
  const handleCloseAuth = () => setShowAuthPopup(false);

  // Auth popup overlay
  const AuthPopup = showAuthPopup ? (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 500 }}>
        <button onClick={handleCloseAuth} style={{ position: "absolute", top: -44, right: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        <AuthPage onLogin={handleLogin} onBack={handleCloseAuth} />
      </div>
    </div>
  ) : null;

  if (view === "landing") return <><LandingPage onAuth={() => setView("auth")} onExploreMap={handleExploreMap} userLocation={userLocation} />{AuthPopup}</>;
  if (view === "explore") return <><ExploreMap userLocation={userLocation} onAuth={handleAuthGate} onBack={() => setView("landing")} user={user} onLogin={handleLogin} />{AuthPopup}</>;
  if (view === "auth") return <AuthPage onLogin={handleLogin} onBack={() => setView("landing")} />;
  if (view === "app" && user) return <MainApp user={user} onLogout={handleLogout} userLocation={userLocation} />;
  return null;
}
