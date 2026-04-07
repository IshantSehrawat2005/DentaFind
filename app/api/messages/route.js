import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const memoryMessages = [];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "chatId required" }, { status: 400 });
    }

    const db = await getDb();

    if (db) {
      const messages = await db.collection("messages").find({ chatId }).sort({ timestamp: 1 }).toArray();
      return NextResponse.json(messages);
    } else {
      return NextResponse.json(memoryMessages.filter((m) => m.chatId === chatId));
    }
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { chatId, senderId, senderName, content } = body;

    if (!chatId || !senderId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = {
      chatId,
      senderId,
      senderName,
      content,
      timestamp: new Date(),
    };

    const db = await getDb();

    if (db) {
      const result = await db.collection("messages").insertOne(message);
      return NextResponse.json({ ...message, _id: result.insertedId });
    } else {
      message._id = Date.now().toString();
      memoryMessages.push(message);
      return NextResponse.json(message);
    }
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
