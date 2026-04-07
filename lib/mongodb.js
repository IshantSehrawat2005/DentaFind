import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  console.warn("⚠️ MONGODB_URI not set — using in-memory fallback for development");
  clientPromise = null;
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDb() {
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db("dentafind");
}
