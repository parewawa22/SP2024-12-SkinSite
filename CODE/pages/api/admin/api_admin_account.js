import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const { acc_id } = req.query;

  if (!acc_id) {
    return res.status(400).json({ error: "Missing acc_id" });
  }

  const db = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await db.execute(
      "SELECT accName, email, accRoles FROM account_skin WHERE acc_id = ?",
      [acc_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({ account: rows[0] });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    db.end();
  }
}
