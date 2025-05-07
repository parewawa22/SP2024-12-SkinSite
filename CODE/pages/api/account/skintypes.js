import mysql from "mysql2/promise";
import { dbConfig } from "./api_account";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    const [rows] = await db.query("SELECT skt_id AS id, sktName AS name FROM SkinType");

    res.status(200).json({ options: rows });
  } catch (error) {
    console.error("Failed to fetch skin types:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.end();
  }
}
