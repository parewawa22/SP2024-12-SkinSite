import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const { pdid } = req.query;

  if (!pdid) {
    return res.status(400).json({ error: "Missing product ID (pdid)" });
  }

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    const [rows] = await db.query(
      `SELECT i.ingd_id, i.ingdName 
       FROM IngdInProduct ip 
       JOIN Ingredient i ON ip.ingdid = i.ingd_id 
       WHERE ip.pdid = ?`,
      [pdid]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching product ingredients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) await db.end();
  }
}
