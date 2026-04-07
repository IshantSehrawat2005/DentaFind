import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat")) || 28.6139;
    const lng = parseFloat(searchParams.get("lng")) || 77.209;
    const radius = parseInt(searchParams.get("radius")) || 15000;

    // Simple, fast Overpass query for dental clinics
    const query = `[out:json][timeout:15];(node["amenity"="dentist"](around:${radius},${lat},${lng});way["amenity"="dentist"](around:${radius},${lat},${lng});node["healthcare"="dentist"](around:${radius},${lat},${lng}););out center body 60;`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Overpass API error");

    const data = await res.json();
    const clinics = data.elements
      .map((el) => {
        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        if (!elLat || !elLng) return null;

        const name = el.tags?.name || el.tags?.["name:en"] || "Dental Clinic";
        const phone = el.tags?.phone || el.tags?.["contact:phone"] || "";
        const address = [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || el.tags?.["addr:full"] || "";

        const R = 6371;
        const dLat = ((elLat - lat) * Math.PI) / 180;
        const dLon = ((elLng - lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((elLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return {
          _id: `osm_${el.id}`, name,
          specialty: el.tags?.["healthcare:speciality"] || "General Dentistry",
          phone, location: { address: address || `Near ${name}`, lat: elLat, lng: elLng },
          distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
          distanceKm: dist,
          openHours: el.tags?.opening_hours || "Call for hours",
          isReal: true, available: true, verified: false,
          bgColor: ["#B6E3F4","#C0AEDE","#FFD5DC","#D1D4F9","#AEFAB8","#FFDFB5"][Math.floor(Math.random()*6)],
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({ clinics, total: clinics.length });
  } catch (error) {
    console.error("Nearby API error:", error.message);
    // Return empty but don't error — the ExploreMap will show seed data as fallback
    return NextResponse.json({ clinics: [], error: error.message, total: 0 });
  }
}
