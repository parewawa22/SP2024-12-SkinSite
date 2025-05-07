import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { stepOrder, pdid, routine_id } = req.body;

  if (!stepOrder || !pdid || !routine_id) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const db = await mysql.createConnection(dbConfig);

  try {
    // 1. Insert new Step (step_id will be created by trigger)
    await db.query(
      `INSERT INTO Step (stepOrder, pdid) VALUES (?, ?)`,
      [stepOrder, pdid]
    );

    // 2. Get the latest step_id (just inserted)
    const [[{ step_id }]] = await db.query(
      `SELECT step_id FROM Step ORDER BY step_id DESC LIMIT 1`
    );

    // 3. Link step to routine
    await db.query(
      `INSERT INTO RoutineStep (stepid, routineid) VALUES (?, ?)`,
      [step_id, routine_id]
    );

    await db.end();
    return res.status(200).json({ message: "Step saved", step_id });

  } catch (err) {
    console.error("❌ Error in /api/api_step:", err);
    await db.end();
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
