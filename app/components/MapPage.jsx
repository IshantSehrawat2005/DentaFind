"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, X, Stethoscope, Loader2, MapPin, Phone, MessageCircle, Calendar, Navigation } from "lucide-react";
import { Stars } from "./Shared";

export default function MapPage({ dentists, onProfile, onBack, userLocation }) {
  const [active, setActive] = useState(null);
  const [realClinics, setRealClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("seed"); // seed = our dentists, real = OSM
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fetch real clinics
  useEffect(() => {
    const lat = userLocation?.lat || 28.6139;
    const lng = userLocation?.lng || 77.209;
    setLoading(true);
    fetch(`/api/nearby?lat=${lat}&lng=${lng}&radius=8000`)
      .then(r => r.json())
      .then(data => { setRealClinics(data.clinics || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userLocation]);

  const allItems = tab === "real" ? realClinics : dentists;

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

      // Light readable tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // User marker
      const userIcon = L.divIcon({
        className: "",
        html: '<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>',
        iconSize: [16, 16], iconAnchor: [8, 8],
      });
      L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("<b>You are here</b>");

      allItems.forEach(d => {
        if (!d.location?.lat) return;
        const isReal = d.isReal;
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${isReal ? "rgba(255,255,255,0.95)" : "rgba(124,58,237,0.9)"};border:2px solid ${isReal ? "#7c3aed" : "rgba(124,58,237,0.4)"};border-radius:12px;padding:4px 10px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:4px;white-space:nowrap">
            <div style="width:6px;height:6px;border-radius:50%;background:${d.available !== false ? "#22c55e" : "#f59e0b"};flex-shrink:0"></div>
            <span style="font-size:11px;font-weight:700;color:${isReal ? "#1a1a2e" : "#fff"}">${d.distance || "₹" + d.fee}</span>
          </div>`,
          iconSize: [90, 30], iconAnchor: [45, 30],
        });
        const marker = L.marker([d.location.lat, d.location.lng], { icon }).addTo(map);
        marker.on("click", () => setActive(d));
      });

      mapInstanceRef.current = map;
    });

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [allItems, userLocation]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-secondary)" }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: "7px 14px", fontSize: 12 }}><ArrowLeft size={14} /> Back</button>
        <div style={{ display: "flex", gap: 6 }}>
          {[["seed", "DentaFind"], ["real", "Real Clinics"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? "rgba(124,58,237,0.12)" : "transparent", border: `1px solid ${tab === k ? "rgba(124,58,237,0.3)" : "var(--border)"}`, borderRadius: "var(--radius-full)", padding: "5px 14px", fontSize: 11, fontWeight: 700, color: tab === k ? "var(--purple-300)" : "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-primary)" }}>
              {l}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{loading ? <Loader2 size={14} className="spin" /> : `${allItems.length} nearby`}</span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div ref={mapRef} style={{ flex: 1, position: "relative" }} />

        {active && (
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "90%", maxWidth: 360 }}>
            <div style={{ borderRadius: "var(--radius-lg)", padding: 18, boxShadow: "var(--shadow-lg)", background: "rgba(14,14,26,0.94)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}>
              <button onClick={() => setActive(null)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer" }}><X size={14} color="var(--text-muted)" /></button>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "var(--radius-sm)", background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Stethoscope size={18} color="var(--purple-400)" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{active.name}</p>
                  <p style={{ margin: "2px 0", fontSize: 11, color: "var(--purple-400)" }}>{active.specialty}{active.distance ? ` · ${active.distance}` : ""}</p>
                  {!active.isReal && <Stars v={active.rating} size={11} />}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {active.phone && <a href={`tel:${active.phone}`} className="btn-primary" style={{ flex: 1, padding: 10, fontSize: 11, justifyContent: "center" }}><Phone size={12} /> <span>Call</span></a>}
                {!active.isReal && <button onClick={() => onProfile(active)} className="btn-accent" style={{ flex: 1, padding: 10, fontSize: 11, justifyContent: "center" }}>View Profile →</button>}
              </div>
            </div>
          </div>
        )}

        <div className="map-sidebar">
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>{tab === "real" ? "Real Clinics" : "DentaFind Dentists"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--text-muted)" }}>{tab === "real" ? "From OpenStreetMap" : "Sorted by distance"}</p>
          </div>
          {allItems.map((d, i) => (
            <div key={d._id || i} onClick={() => setActive(d)}
              style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: active?._id === d._id ? "rgba(124,58,237,0.08)" : "transparent", transition: "background 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, flex: 1 }}>{d.name}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal-400)" }}>{d.distance || ""}</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text-muted)" }}>{d.specialty}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
