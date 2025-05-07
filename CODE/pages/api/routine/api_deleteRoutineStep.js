import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { stepid } = req.query;

  if (!stepid) {
    return res.status(400).json({ message: "Missing stepid" });
  }

  const db = await mysql.createConnection(dbConfig);

  try {
    await db.query("DELETE FROM RoutineStep WHERE stepid = ?", [stepid]);

    const [result] = await db.query("DELETE FROM Step WHERE step_id = ?", [stepid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Step not found" });
    }

    await db.end();
    return res.status(200).json({ message: "Step deleted successfully" });

  } catch (err) {
    console.error(" Error deleting step:", err);
    await db.end();
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
