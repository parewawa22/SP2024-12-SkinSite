import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const db = await mysql.createConnection(dbConfig);

  const { acc_id, accName, email, pwd, gender, dob } = req.body;

  if (!acc_id) return res.status(400).json({ message: "Missing account ID" });

  try {
    if (req.method === "PUT") {
      const query = `
        UPDATE account_skin 
        SET accName = ?, email = ?, pwd = ?, gender = ?, dob = ? 
        WHERE acc_id = ?`;
      const [result] = await db.execute(query, [accName, email, pwd, gender, dob, acc_id]);

      return res.status(200).json({ message: "Account updated successfully" });
    }

    if (req.method === "DELETE") {
      const [result] = await db.execute(`DELETE FROM account_skin WHERE acc_id = ?`, [acc_id]);

      return res.status(200).json({ message: "Account deleted successfully" });
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  } finally {
    await db.end();
  }
}
