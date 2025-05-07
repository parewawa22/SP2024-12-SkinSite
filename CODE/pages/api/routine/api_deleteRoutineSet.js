import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { routine_id } = req.body;
  if (!routine_id) {
    return res.status(400).json({ error: "Missing routine_id" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [stepRows] = await connection.execute(
      "SELECT stepid FROM RoutineStep WHERE routineid = ?",
      [routine_id]
    );
    const stepIds = stepRows.map(row => row.stepid);

    await connection.execute(
      "DELETE FROM RoutineStep WHERE routineid = ?",
      [routine_id]
    );

    if (stepIds.length > 0) {
      await connection.query(
        `DELETE FROM Step WHERE step_id IN (${stepIds.map(() => '?').join(',')})`,
        stepIds
      );
    }

    await connection.execute(
      "DELETE FROM routineset WHERE routine_id = ?",
      [routine_id]
    );

    res.status(200).json({ message: "Routine deleted successfully" });
  } catch (error) {
    console.error("❌ DB Delete Error:", error);
    res.status(500).json({ error: "Failed to delete routine" });
  } finally {
    if (connection) await connection.end();
  }
}