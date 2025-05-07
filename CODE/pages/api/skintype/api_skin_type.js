import mysql from "mysql2/promise";
import { dbConfig } from "../admin/api_admin_account"; 

export default async function handler(req, res) {
  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query("SELECT skt_id, sktName FROM SkinType ORDER BY sktName ASC");
    await db.end();

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching skin types:", err);
    res.status(500).json({ error: "Error fetching skin types", message: err.message });
  }
}
