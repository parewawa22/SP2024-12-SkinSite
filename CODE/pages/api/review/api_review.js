import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    if (req.method === 'GET') {
      const { pdid } = req.query;

      // Fetch reviews for a specific product if `pdid` is provided
      if (pdid) {
        const [rows] = await connection.execute(
          `SELECT 
            r.pdid,
            r.accid,
            a.accName,
            s.sktName,
            r.scoreRating,
            r.rvdate,
            r.textReview
          FROM review r
          JOIN account_skin a ON r.accid = a.acc_id
          JOIN SkinType s ON a.sktid = s.skt_id
          WHERE r.pdid = ?
          ORDER BY r.rvdate DESC`,
          [pdid]
        );

        await connection.end();
        res.status(200).json(rows);
        return;
      }

      await connection.end();
      res.status(200).json(allRows);
      return;
    }

    if (req.method === 'DELETE') {
      const { pdid, accid } = req.query;

      if (!pdid || !accid) {
        res.status(400).json({ error: 'Product ID (pdid) and Account ID (accid) are required' });
        return;
      }

      await connection.execute(
        `DELETE FROM review WHERE pdid = ? AND accid = ?`,
        [pdid, accid]
      );

      await connection.end();
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error handling review API:', err);
    res.status(500).json({ error: 'Failed to process reviews' });
  }
}