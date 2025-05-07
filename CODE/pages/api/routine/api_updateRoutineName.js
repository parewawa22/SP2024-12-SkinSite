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

  const db = await mysql.createConnection(dbConfig);

  try {
    const { routine_id, newRoutineName } = req.body;

    if (!routine_id || !newRoutineName) {
      return res.status(400).json({ message: "Missing routine_id or newRoutineName" });
    }

    // ✅ Update routine name
    const [result] = await db.query(
      `UPDATE routineset SET routineName = ? WHERE routine_id = ?`,
      [newRoutineName, routine_id]
    );

    await db.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Routine not found or no change made." });
    }

    return res.status(200).json({ message: "Routine name updated successfully." });
  } catch (err) {
    console.error("❌ Error updating routine name:", err);
    await db.end();
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
