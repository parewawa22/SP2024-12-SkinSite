import mysql from "mysql2/promise";
import { dbConfig } from "./api_account";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { accid, sktid } = req.body;

  if (!accid || !sktid) {
    return res.status(400).json({ message: "Missing accid or sktid" });
  }

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    const [rows] = await db.query(
      `UPDATE account_skin SET sktid = ? WHERE acc_id = ?`,
      [sktid, accid]
    );

    return res.status(200).json({ message: "Skin Type updated successfully" });
  } catch (error) {
    console.error("Error updating skin type:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db) await db.end();
  }
}
