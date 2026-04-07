import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await getDb();

    if (db) {
      await db.collection("doctors").updateOne(
        { userId: body.userId },
        {
          $set: {
            name: body.name,
            specialty: body.specialty,
            clinic: body.clinic,
            education: body.education,
            experience: body.experience,
            about: body.about,
            services: body.services || [],
            fee: body.fee || 500,
            location: body.location || { address: "", lat: 28.6139, lng: 77.209 },
            openHours: body.openHours || "Mon-Sat, 10 AM-6 PM",
            phone: body.phone || "",
            bgColor: body.bgColor || "#c084fc",
            available: body.available !== false,
            nextSlot: body.nextSlot || "Contact",
            rating: body.rating || 4.5,
            reviewCount: body.reviewCount || 0,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: true, note: "In-memory mode" });
    }
  } catch (error) {
    console.error("Doctor profile update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
