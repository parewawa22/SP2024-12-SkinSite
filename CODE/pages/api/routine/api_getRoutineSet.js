import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { accid, routineType } = req.query;
    if (!accid) {
      return res.status(400).json({ message: "Missing accid" });
    }

    const db = await mysql.createConnection(dbConfig);

    let query = `
      SELECT MIN(routine_id) AS routine_id, routineName, routineType
      FROM routineset
      WHERE accid = ?
    `;
    const values = [accid];

    if (routineType) {
      query += " AND routineType = ?";
      values.push(routineType);
    }

    query += " GROUP BY routineName, routineType";

    const [rows] = await db.query(query, values);

    await db.end();
    return res.status(200).json({ routines: rows });
  } catch (err) {
    console.error("RoutineSet fetch error:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
