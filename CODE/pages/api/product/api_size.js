import mysql from "mysql2/promise";
import { dbConfig } from "../admin/api_admin_account";

export default async function handler(req, res) {
  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.execute("SELECT volumn, unit FROM Size ORDER BY volumn ASC");
    await db.end();
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching sizes:", err);
    res.status(500).json({ error: "Failed to load sizes", message: err.message });
  }
}
