import mysql from "mysql2/promise";
import { dbConfig } from "./api_admin_account";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { brandName, brandDescription } = req.body;

  if (!brandName || !brandDescription) {
    return res.status(400).json({ error: "Missing brand name or description" });
  }

  try {
    const db = await mysql.createConnection(dbConfig);

    // Check if brand already exists
    const [exists] = await db.execute(
      "SELECT * FROM Brand WHERE brandName = ?",
      [brandName]
    );
    if (exists.length > 0) {
      return res.status(409).json({ error: "Brand already exists" });
    }

    await db.execute(
      "INSERT INTO Brand (brandName, brandDescription) VALUES (?, ?)",
      [brandName, brandDescription]
    );

    res.status(200).json({ message: "Brand added successfully" });
  } catch (error) {
    console.error("❌ Error inserting brand:", error);
    res.status(500).json({ error: "Failed to add brand" });
  }
}
