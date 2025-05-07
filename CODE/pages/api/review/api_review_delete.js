import mysql from "mysql2/promise";

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export default async function handler(req, res) {
    if (req.method !== "DELETE") return res.status(405).json({ error: "Method Not Allowed" });

    const { pdid, accid } = req.body;

    if (!pdid || !accid) return res.status(400).json({ error: "Missing fields" });

    try {
        const db = await mysql.createConnection(dbConfig);
        await db.execute(`DELETE FROM review WHERE pdid = ? AND accid = ?`, [pdid, accid]);
        await db.end();
        res.status(200).json({ message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting review" });
    }
}
