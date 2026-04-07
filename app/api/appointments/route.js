import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// In-memory store for development
const memoryAppointments = [];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    const db = await getDb();

    if (db) {
      const filter = role === "doctor" ? { doctorId: userId } : { patientId: userId };
      const appointments = await db.collection("appointments").find(filter).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(appointments);
    } else {
      const filtered = memoryAppointments.filter((a) =>
        role === "doctor" ? a.doctorId === userId : a.patientId === userId
      );
      return NextResponse.json(filtered);
    }
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { patientId, patientName, doctorId, doctorName, doctorSpecialty, doctorClinic, doctorLocation, date, slot, reason } = body;

    const appointment = {
      patientId,
      patientName,
      doctorId,
      doctorName,
      doctorSpecialty,
      doctorClinic,
      doctorLocation,
      date,
      slot,
      reason: reason || "",
      status: "confirmed",
      createdAt: new Date(),
    };

    const db = await getDb();

    if (db) {
      const result = await db.collection("appointments").insertOne(appointment);
      return NextResponse.json({ ...appointment, _id: result.insertedId });
    } else {
      appointment._id = Date.now().toString();
      memoryAppointments.push(appointment);
      return NextResponse.json(appointment);
    }
  } catch (error) {
    console.error("Appointments POST error:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
