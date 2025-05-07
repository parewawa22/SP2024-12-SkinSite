import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  let db;
  try {
    db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query(`SELECT ingd_id, ingdName FROM Ingredient ORDER BY ingdName ASC`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) await db.end();
  }
}
