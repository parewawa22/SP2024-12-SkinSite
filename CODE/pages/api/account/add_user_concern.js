import mysql from "mysql2/promise";
import { dbConfig } from "./api_account";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { accid, benefitid, concernid, ingdid } = req.body;

  if (!accid || (!benefitid && !concernid && !ingdid)) {
    return res.status(400).json({ error: "Missing data" });
  }

  let db = await mysql.createConnection(dbConfig);
  await db.query(
    `INSERT IGNORE INTO UserConcern (accid, benefitid, concernid, ingdid) VALUES (?, ?, ?, ?)`,
    [accid, benefitid || null, concernid || null, ingdid || null]
  );
  res.status(200).json({ message: "Added to UserConcern" });
}
