import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const { routine_id } = req.query;
  if (!routine_id)
    return res.status(400).json({ message: "Missing routine_id" });

  try {
    const db = await mysql.createConnection(dbConfig);

    // ✅ 1. Fetch steps with product info
    const [steps] = await db.query(
      `SELECT 
        s.step_id, 
        s.stepOrder, 
        s.pdid,
        p.pdName AS productName,
        p.photo, 
        p.pdDescription AS description,
        pr.price
      FROM RoutineStep rs
      JOIN Step s ON rs.stepid = s.step_id
      LEFT JOIN Product p ON s.pdid = p.pd_id
      LEFT JOIN Price pr ON pr.pdid = p.pd_id
      WHERE rs.routineid = ?
      ORDER BY s.stepOrder ASC`,
      [routine_id]
    );

    // ✅ 2. Fetch routine name
    const [[routineInfo]] = await db.query(
      `SELECT routineName FROM routineset WHERE routine_id = ? LIMIT 1`,
      [routine_id]
    );

    await db.end();

    return res.status(200).json({
      routine_id,
      routineName: routineInfo?.routineName || "Untitled",
      products: steps,
    });
  } catch (err) {
    console.error("Routine detail fetch error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}
