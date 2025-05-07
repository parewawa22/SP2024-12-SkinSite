import mysql from "mysql2/promise";

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export default async function handler(req, res) {
    if (req.method !== "PUT") return res.status(405).json({ error: "Method Not Allowed" });

    const { pdid, accid, textReview, scoreRating } = req.body;

    if (!pdid || !accid || !textReview || !scoreRating) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        const db = await mysql.createConnection(dbConfig);
        await db.execute(
            `UPDATE review SET textReview = ?, scoreRating = ? WHERE pdid = ? AND accid = ?`,
            [textReview, scoreRating, pdid, accid]
        );
        await db.end();
        return res.status(200).json({ message: "Review updated" });
    } catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({ error: "Database error", detail: err.message });
    }
}
