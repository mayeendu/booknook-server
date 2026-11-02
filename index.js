import "dotenv/config";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;
const client = mongoUri ? new MongoClient(mongoUri) : null;
let databaseReady = false;

app.use(cors());
app.use(express.json());

export async function connectToMongoDB() {
  if (!client) {
    console.error("MONGODB_URI is not set; book storage is unavailable.");
    return false;
  }

  try {
    await client.connect();
    databaseReady = true;
    console.log("You successfully connected to MongoDB!");
    return true;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    return false;
  }
}

app.post("/add-book", async (req, res) => {
  if (!databaseReady || !client) {
    return res.status(503).json({ error: "Book storage is unavailable" });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Request body must be a JSON object" });
  }

  try {
    const db = client.db("booknook_db");
    const result = await db.collection("books").insertOne(req.body);
    return res.status(201).json({ message: "Book added", id: result.insertedId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add book" });
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "BookNook server is running fine" });
});

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  return next(err);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

await connectToMongoDB();

app.listen(PORT, () => {
  console.log(`BookNook server listening on port ${PORT}`);
});
