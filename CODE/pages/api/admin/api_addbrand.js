import mysql from "mysql2/promise";
import { dbConfig } from "./api_admin_account"; 

export default async function handler(req, res) {
  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query("SELECT brand_id, brandName FROM Brand ORDER BY brandName ASC");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching brands", message: err.message });
  }
}
