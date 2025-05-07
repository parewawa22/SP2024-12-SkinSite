import mysql from "mysql2/promise";

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { stepid, pdid } = req.body;
  if (!stepid || !pdid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const db = await mysql.createConnection(dbConfig);
  try {
    await db.query("UPDATE Step SET pdid = ? WHERE step_id = ?", [pdid, stepid]);
    await db.end();
    return res.status(200).json({ message: "Step updated" });
  } catch (err) {
    await db.end();
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
}
