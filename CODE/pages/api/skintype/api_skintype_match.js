import mysql from 'mysql2/promise';
import { dbConfig } from "../account/api_account";

export default async function handler(req, res) {
  const { pdid } = req.query;

  if (!pdid) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [skinTypes] = await connection.execute(`
      SELECT st.sktName
      FROM ProductSkinType pst
      JOIN SkinType st ON pst.sktid = st.skt_id
      WHERE pst.pdid = ?
      ORDER BY st.sktName
    `, [pdid]);

    // Map the results to match concerns/benefits format
    const skinTypeNames = skinTypes.map(st => st.sktName);
    return res.status(200).json(skinTypeNames);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch skin types' });
  } finally {
    if (connection) await connection.end();
  }
}