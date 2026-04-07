import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { memoryUsers } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!["patient", "doctor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const db = await getDb();

    if (db) {
      const existing = await db.collection("users").findOne({ email });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      const result = await db.collection("users").insertOne({
        name,
        email,
        passwordHash,
        phone: phone || "",
        role,
        createdAt: new Date(),
        avatar: "",
      });

      if (role === "doctor") {
        await db.collection("doctors").insertOne({
          _id: result.insertedId,
          userId: result.insertedId.toString(),
          name,
          email,
          phone: phone || "",
          specialty: "",
          clinic: "",
          education: "",
          experience: "",
          about: "",
          services: [],
          fee: 500,
          location: { address: "", lat: 28.6139, lng: 77.209 },
          openHours: "Mon-Sat, 10 AM-6 PM",
          verified: false,
          rating: 0,
          reviewCount: 0,
          avatar: "",
          bgColor: "#c084fc",
          createdAt: new Date(),
        });
      }

      return NextResponse.json({ success: true, userId: result.insertedId.toString() });
    } else {
      // In-memory fallback
      const existing = memoryUsers.find((u) => u.email === email);
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      const userId = Date.now().toString();
      memoryUsers.push({
        id: userId,
        name,
        email,
        passwordHash,
        phone: phone || "",
        role,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, userId });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
