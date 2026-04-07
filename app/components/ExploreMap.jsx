"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, X, Stethoscope, MapPin, Star, Phone, MessageCircle, Calendar, Loader2, Navigation } from "lucide-react";

export default function ExploreMap({ userLocation, onAuth, onBack, user }) {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const lat = userLocation?.lat || 28.6139;
    const lng = userLocation?.lng || 77.209;
    setLoading(true);
    // Fetch both: real OSM clinics + DentaFind seed dentists
    Promise.all([
      fetch(`/api/nearby?lat=${lat}&lng=${lng}&radius=15000`).then(r => r.json()).catch(() => ({ clinics: [] })),
      fetch(`/api/dentists?lat=${lat}&lng=${lng}`).then(r => r.json()).catch(() => []),
    ]).then(([nearby, dentists]) => {
      const real = nearby.clinics || [];
      const seed = (Array.isArray(dentists) ? dentists : []).map(d => ({ ...d, isSeed: true }));
      // Merge: real OSM first, then seed dentists
      setClinics([...real, ...seed]);
      setLoading(false);
    });
  }, [userLocation]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then(L => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      const lat = userLocation?.lat || 28.6139;
      const lng = userLocation?.lng || 77.209;
      const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 13);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // User marker
      const userIcon = L.divIcon({
        className: "",
        html: '<div style="width:18px;height:18px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 5px rgba(59,130,246,0.25),0 2px 8px rgba(0,0,0,0.3)"></div>',
        iconSize: [18, 18], iconAnchor: [9, 9],
      });
      L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("<b>You are here</b>");

      // Clinic markers
      markersRef.current = [];
      clinics.forEach(c => {
        if (!c.location?.lat) return;
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:rgba(255,255,255,0.95);border:2px solid #7c3aed;border-radius:12px;padding:4px 10px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:4px;white-space:nowrap">
            <div style="width:6px;height:6px;border-radius:50%;background:${c.available ? "#22c55e" : "#f59e0b"};flex-shrink:0"></div>
            <span style="font-size:11px;font-weight:700;color:#1a1a2e">${c.distance}</span>
          </div>`,
          iconSize: [90, 30], iconAnchor: [45, 15],
        });
        const marker = L.marker([c.location.lat, c.location.lng], { icon }).addTo(map);
        marker.on("click", () => setActive(c));
        markersRef.current.push(marker);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [clinics, userLocation]);

  const handleAction = () => {
    if (!user) { onAuth(); } // Show auth popup
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <nav className="navbar" style={{ zIndex: 1000 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: "8px 14px", fontSize: 12 }}><ArrowLeft size={14} /> Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="navbar-logo" style={{ padding: "4px 6px" }}><Stethoscope size={14} color="#fff" /></div>
          <span style={{ fontSize: 16, fontWeight: 900 }}>Explore Dentists</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loading && <Loader2 size={16} className="spin" color="var(--purple-400)" />}
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{clinics.length} clinics found</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <div ref={mapRef} style={{ flex: 1 }} />

        {/* Active clinic popup */}
        {active && (
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "90%", maxWidth: 380 }}>
            <div className="glass-strong" style={{ borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-lg)", background: "rgba(14,14,26,0.92)" }}>
              <button onClick={() => setActive(null)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={14} /></button>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <Stethoscope size={20} color="var(--purple-400)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800 }}>{active.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--purple-400)" }}>{active.specialty}</p>
                </div>
                {active.isReal && <span className="badge badge-blue" style={{ fontSize: 9 }}>OpenStreetMap</span>}
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 12 }}>
                <div><span style={{ color: "var(--text-muted)" }}>Distance</span><p style={{ margin: "2px 0 0", fontWeight: 800 }}>{active.distance}</p></div>
                <div><span style={{ color: "var(--text-muted)" }}>Hours</span><p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 11 }}>{active.openHours}</p></div>
                {active.phone && <div><span style={{ color: "var(--text-muted)" }}>Phone</span><p style={{ margin: "2px 0 0", fontWeight: 700 }}>{active.phone}</p></div>}
              </div>
              {active.location?.address && (
                <p style={{ margin: "0 0 14px", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {active.location.address}</p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {active.phone && (
                  <a href={`tel:${active.phone}`} className="btn-primary" style={{ flex: 1, padding: 11, fontSize: 12, justifyContent: "center" }}><Phone size={13} /> <span>Call</span></a>
                )}
                <button onClick={handleAction} className="btn-primary" style={{ flex: 1, padding: 11, fontSize: 12, justifyContent: "center" }}><span><MessageCircle size={13} /> Chat</span></button>
                <button onClick={handleAction} className="btn-accent" style={{ flex: 1, padding: 11, fontSize: 12, justifyContent: "center" }}><Calendar size={13} /> Book</button>
              </div>
              {!user && <p style={{ margin: "10px 0 0", fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>Sign in to chat and book appointments</p>}
            </div>
          </div>
        )}

        {/* Sidebar list */}
        <div className="map-sidebar">
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800 }}>Nearby Clinics</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Real dental clinics from OpenStreetMap</p>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Loader2 size={24} className="spin" color="var(--purple-400)" />
              <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Finding clinics near you…</p>
            </div>
          ) : clinics.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>No clinics found nearby</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Try allowing location access</p>
            </div>
          ) : (
            clinics.map((c, i) => (
              <div key={c._id || i} onClick={() => setActive(c)}
                style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: active?._id === c._id ? "rgba(124,58,237,0.08)" : "transparent", transition: "background 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, flex: 1 }}>{c.name}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal-400)", flexShrink: 0 }}>{c.distance}</span>
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-muted)" }}>{c.specialty}</p>
                {c.location?.address && <p style={{ margin: 0, fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}><MapPin size={9} /> {c.location.address}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
