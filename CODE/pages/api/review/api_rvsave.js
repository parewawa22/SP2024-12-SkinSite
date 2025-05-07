import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const db = await mysql.createConnection(dbConfig);

  if (req.method === "POST") {
    const { pdid, accid, scoreRating, textReview } = req.body;
    const rvdate = new Date(); 

    if (!pdid || !accid || !scoreRating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      await db.execute(
        `INSERT INTO review (pdid, accid, scoreRating, textReview, rvdate)
         VALUES (?, ?, ?, ?, ?)`,
        [pdid, accid, scoreRating, textReview, rvdate]
      );
      return res.status(200).json({ message: "Review submitted successfully" });
    } catch (err) {
      console.error("Error inserting review:", err);
      return res.status(500).json({ error: "Database error", detail: err.message });
    } finally {
      await db.end();
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
