import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accid } = req.query;

  if (!accid) {
    return res.status(400).json({ error: 'Account ID (accid) is required' });
  }

  try {
    const db = await mysql.createConnection(dbConfig);

    const [rows] = await db.execute(
      `SELECT 
        p.pd_id,
        r.accid,
        p.pdName,
        p.photo,
        r.scoreRating,
        r.rvdate,
        r.textReview
      FROM review r
      JOIN Product p ON r.pdid = p.pd_id
      WHERE r.accid = ?`,
      [accid]
    );

    await db.end();

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ error: 'Failed to load reviews' });
  }
}
