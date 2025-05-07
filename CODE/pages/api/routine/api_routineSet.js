// pages/api/api_routineSet.js
import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const db = await mysql.createConnection(dbConfig);

  try {
    if (req.method === "POST") {
      const { accid, routineType, routineName, steps } = req.body;

      if (!accid || !routineType || !routineName || !Array.isArray(steps)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await db.query(
        `INSERT INTO routineset (accid, routineType, routineName) VALUES (?, ?, ?)`,
        [accid, routineType, routineName]
      );

      const [[{ routine_id }]] = await db.query(
        `SELECT routine_id FROM routineset ORDER BY routine_id DESC LIMIT 1`
      );

      for (const { stepOrder, pdid } of steps) {
        await db.query(
          `INSERT INTO Step (stepOrder, pdid) VALUES (?, ?)`,
          [stepOrder, pdid]
        );

        const [[{ step_id }]] = await db.query(
          `SELECT step_id FROM Step ORDER BY step_id DESC LIMIT 1`
        );

        await db.query(
          `INSERT INTO RoutineStep (stepid, routineid) VALUES (?, ?)`,
          [step_id, routine_id]
        );
      }

      await db.end();
      return res.status(200).json({ message: "Routine created successfully", routine_id });
    }

    else if (req.method === "GET") {
      const { accid, routineType } = req.query;

      if (!accid || !routineType) {
        return res.status(400).json({ message: "Missing accid or routineType" });
      }

      const [rows] = await db.query(
        `SELECT MIN(routine_id) AS routine_id, routineName 
         FROM routineset 
         WHERE accid = ? AND routineType = ? 
         GROUP BY routineName`,
        [accid, routineType]
      );

      await db.end();
      return res.status(200).json({ routines: rows });
    }

    else {
      await db.end();
      return res.status(405).json({ message: "Method not allowed" });
    }

  } catch (error) {
    console.error("❌ API RoutineSet error:", error);
    await db.end();
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
