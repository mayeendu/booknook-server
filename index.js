import "dotenv/config";
import cors from "cors";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

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

app.get("/all-books", async (_req, res) => {
  if (!databaseReady || !client) {
    return res.status(503).json({ error: "Book storage is unavailable" });
  }
  try {
    const db = client.db("booknook_db");
    const books = await db.collection("books").find({}).toArray();
    return res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch books" });
  }

});

app.get("/my-books", async (_req, res) => {
  if (!databaseReady || !client) {
    return res.status(503).json({ error: "Book storage is unavailable" });
  }

  try {
    const books = await client.db("booknook_db").collection("my_books")
      .find({}).sort({ savedAt: -1 }).toArray();
    return res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch saved books" });
  }
});

app.post("/my-books", async (req, res) => {
  if (!databaseReady || !client) {
    return res.status(503).json({ error: "Book storage is unavailable" });
  }

  const bookId = req.body?.bookId;
  if (typeof bookId !== "string" || !/^[a-f0-9]{24}$/i.test(bookId)) {
    return res.status(400).json({ error: "A valid book ID is required" });
  }

  try {
    const db = client.db("booknook_db");
    const book = await db.collection("books").findOne({ _id: new ObjectId(bookId) });
    if (!book) return res.status(404).json({ error: "Book not found" });

    // Keeping the original book ID makes repeated saves idempotent.
    const result = await db.collection("my_books").updateOne(
      { _id: book._id },
      { $setOnInsert: { ...book, savedAt: new Date() } },
      { upsert: true },
    );
    return res.status(result.upsertedCount ? 201 : 200).json({
      message: result.upsertedCount ? "Book saved" : "Book already saved",
      bookId,
      alreadySaved: result.upsertedCount === 0,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: "Book already saved", bookId, alreadySaved: true });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to save book" });
  }
});

app.delete('/my-books/:id', async (req, res) => {
  if (!databaseReady || !client) {
    return res.status(503).json({ error: 'Book storage is unavailable' });
  }

  const bookId = req.params.id;
  if (!/^[a-f0-9]{24}$/i.test(bookId)) {
    return res.status(400).json({ error: 'A valid book ID is required' });
  }

  try {
    // All Books keeps the original; only remove the saved selection.
    const result = await client.db('booknook_db').collection('my_books')
      .deleteOne({ _id: new ObjectId(bookId) });
    return res.status(200).json({
      message: result.deletedCount ? 'Book removed from My Books' : 'Book already removed from My Books',
      bookId,
      removed: result.deletedCount > 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to remove book from My Books' });
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


