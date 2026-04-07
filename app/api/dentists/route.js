import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const SEED_DENTISTS = [
  { _id: "1", userId: "1", name: "Dr. Priya Sharma", specialty: "Cosmetic Dentistry", rating: 4.9, reviewCount: 284, experience: "12 yrs", location: { address: "Connaught Place, Delhi", lat: 28.6315, lng: 77.2167 }, distance: "0.8 km", available: true, nextSlot: "Today 3:00 PM", fee: 500, bgColor: "#B6E3F4", services: ["Teeth Whitening", "Veneers", "Bonding", "Implants", "Smile Design"], verified: true, clinic: "Smile Studio Delhi", education: "BDS, MDS – AIIMS Delhi", about: "Award-winning cosmetic dentist specialising in smile makeovers. Over 12 years of crafting beautiful smiles.", openHours: "Mon–Sat, 10 AM–7 PM", badge: "Top Rated", phone: "+91 98765 43210" },
  { _id: "2", userId: "2", name: "Dr. Arjun Mehta", specialty: "Orthodontics", rating: 4.8, reviewCount: 195, experience: "8 yrs", location: { address: "Lajpat Nagar, Delhi", lat: 28.5700, lng: 77.2373 }, distance: "1.2 km", available: true, nextSlot: "Today 5:30 PM", fee: 600, bgColor: "#C0AEDE", services: ["Braces", "Invisalign", "Retainers", "Jaw Alignment"], verified: true, clinic: "OrthoSmile Center", education: "BDS, MDS – Manipal University", about: "Orthodontic specialist renowned for precision smile alignment.", openHours: "Mon–Sat, 9 AM–6 PM", badge: "Invisalign Gold", phone: "+91 98765 43211" },
  { _id: "3", userId: "3", name: "Dr. Sneha Gupta", specialty: "Pediatric Dentistry", rating: 4.9, reviewCount: 342, experience: "10 yrs", location: { address: "Dwarka, Delhi", lat: 28.5921, lng: 77.0460 }, distance: "2.1 km", available: false, nextSlot: "Tomorrow 10:00 AM", fee: 400, bgColor: "#FFD5DC", services: ["Child Checkup", "Fluoride Treatment", "Sealants"], verified: true, clinic: "KidsDent Clinic", education: "BDS, MDS – Delhi University", about: "Delhi's most beloved pediatric dentist.", openHours: "Mon–Fri, 9 AM–5 PM", badge: "Kids Favourite", phone: "+91 98765 43212" },
  { _id: "4", userId: "4", name: "Dr. Rahul Verma", specialty: "Oral Surgery", rating: 4.7, reviewCount: 167, experience: "15 yrs", location: { address: "Saket, Delhi", lat: 28.5244, lng: 77.2066 }, distance: "2.8 km", available: true, nextSlot: "Today 4:00 PM", fee: 800, bgColor: "#D1D4F9", services: ["Tooth Extraction", "Dental Implants", "Wisdom Teeth"], verified: true, clinic: "MaxilloFacial Center", education: "BDS, MDS – PGI Chandigarh", about: "Senior oral surgeon with 5,000+ successful procedures.", openHours: "Tue–Sun, 10 AM–6 PM", badge: "", phone: "+91 98765 43213" },
  { _id: "5", userId: "5", name: "Dr. Kavya Nair", specialty: "Periodontics", rating: 4.6, reviewCount: 128, experience: "7 yrs", location: { address: "Vasant Kunj, Delhi", lat: 28.5194, lng: 77.1537 }, distance: "3.4 km", available: true, nextSlot: "Tomorrow 9:00 AM", fee: 550, bgColor: "#AEFAB8", services: ["Deep Scaling", "Root Planing", "Gum Surgery"], verified: true, clinic: "PerioCare Clinic", education: "BDS, MDS – Amrita University", about: "Gum health evangelist.", openHours: "Mon–Sat, 9 AM–5 PM", badge: "", phone: "+91 98765 43214" },
  { _id: "6", userId: "6", name: "Dr. Vikram Singh", specialty: "Endodontics", rating: 4.8, reviewCount: 203, experience: "11 yrs", location: { address: "Punjabi Bagh, Delhi", lat: 28.6682, lng: 77.1230 }, distance: "4.1 km", available: true, nextSlot: "Today 6:00 PM", fee: 700, bgColor: "#FFDFB5", services: ["Root Canal", "Re-treatment", "Pulp Therapy"], verified: true, clinic: "EndoCare Delhi", education: "BDS, MDS – Rajiv Gandhi University", about: "The root canal specialist who makes the procedure painless.", openHours: "Mon–Sat, 10 AM–7 PM", badge: "Root Canal Expert", phone: "+91 98765 43215" },
  { _id: "7", userId: "7", name: "Dr. Meera Joshi", specialty: "General Dentistry", rating: 4.5, reviewCount: 291, experience: "9 yrs", location: { address: "Rohini, Delhi", lat: 28.7495, lng: 77.0565 }, distance: "5.2 km", available: true, nextSlot: "Today 2:30 PM", fee: 350, bgColor: "#C1F1D9", services: ["Full Checkup", "Professional Cleaning", "Fillings"], verified: true, clinic: "FamilyCare Dental", education: "BDS – Kasturba Medical College", about: "Your friendly neighbourhood family dentist.", openHours: "Mon–Sun, 9 AM–8 PM", badge: "", phone: "+91 98765 43216" },
  { _id: "8", userId: "8", name: "Dr. Aditya Rao", specialty: "Implantology", rating: 4.9, reviewCount: 156, experience: "13 yrs", location: { address: "Greater Kailash, Delhi", lat: 28.5494, lng: 77.2424 }, distance: "3.1 km", available: false, nextSlot: "Tomorrow 11:00 AM", fee: 1200, bgColor: "#FBD3A0", services: ["Single Implant", "All-on-4", "Bone Grafting"], verified: true, clinic: "Implant Hub Delhi", education: "BDS, MDS, PhD – Implantology", about: "India's foremost implantologist.", openHours: "Mon–Sat, 10 AM–6 PM", badge: "PhD Specialist", phone: "+91 98765 43217" },
];

const SEED_REVIEWS = {
  "1": [{ patientName: "Ananya K.", rating: 5, createdAt: "2 days ago", text: "Dr. Sharma is genuinely magical. My teeth whitening exceeded every expectation." }, { patientName: "Rohan M.", rating: 5, createdAt: "1 week ago", text: "Got veneers done. Absolute perfection." }],
  "2": [{ patientName: "Deepak A.", rating: 5, createdAt: "3 days ago", text: "Dr. Mehta's Invisalign treatment has been life-changing!" }],
  "3": [{ patientName: "Priti R.", rating: 5, createdAt: "1 day ago", text: "My son now looks forward to visits — Dr. Sneha is incredible!" }],
  "6": [{ patientName: "Gaurav P.", rating: 5, createdAt: "2 days ago", text: "Dr. Singh made root canal completely painless." }],
  "8": [{ patientName: "Vijay N.", rating: 5, createdAt: "5 days ago", text: "All-on-4 done by Dr. Rao. Life-changing." }],
};

function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const specialty = searchParams.get("specialty");
    const userLat = parseFloat(searchParams.get("lat")) || 28.6139;
    const userLng = parseFloat(searchParams.get("lng")) || 77.209;

    const db = await getDb();

    if (id) {
      // Single dentist lookup
      if (db) {
        const { ObjectId } = await import("mongodb");
        let dentist;
        try { dentist = await db.collection("doctors").findOne({ _id: new ObjectId(id) }); } catch {}
        if (!dentist) dentist = await db.collection("doctors").findOne({ userId: id });
        if (dentist) {
          const reviews = await db.collection("reviews").find({ doctorId: id }).sort({ createdAt: -1 }).toArray();
          return NextResponse.json({ ...dentist, reviews });
        }
      }
      const seedD = SEED_DENTISTS.find(d => d._id === id);
      if (seedD) return NextResponse.json({ ...seedD, reviews: SEED_REVIEWS[id] || [] });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get registered doctors from DB
    let dbDoctors = [];
    if (db) {
      dbDoctors = await db.collection("doctors").find({}).toArray();
      // Enrich with defaults
      dbDoctors = dbDoctors.map(d => ({
        ...d,
        _id: d._id.toString(),
        rating: d.rating || 4.5,
        reviewCount: d.reviewCount || 0,
        available: d.available !== false,
        verified: true,
        nextSlot: d.nextSlot || "Contact",
        badge: d.badge || "New Doctor",
        bgColor: d.bgColor || "#c084fc",
        isRegistered: true,
        distance: d.location?.lat ? (() => {
          const dist = calcDist(userLat, userLng, d.location.lat, d.location.lng);
          return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
        })() : "N/A",
      }));
    }

    // Always include seed dentists with distance
    let seedList = SEED_DENTISTS.map(d => ({
      ...d,
      distance: (() => {
        const dist = calcDist(userLat, userLng, d.location.lat, d.location.lng);
        return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
      })(),
    }));

    // Merge: registered doctors first, then seed
    let allDentists = [...dbDoctors, ...seedList];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      allDentists = allDentists.filter(d =>
        d.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q) || d.location?.address?.toLowerCase().includes(q) || d.clinic?.toLowerCase().includes(q)
      );
    }
    if (specialty) {
      allDentists = allDentists.filter(d => d.specialty?.toLowerCase().includes(specialty.toLowerCase()));
    }

    return NextResponse.json(allDentists);
  } catch (error) {
    console.error("Dentists API error:", error);
    return NextResponse.json(SEED_DENTISTS);
  }
}
