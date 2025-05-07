import mysql from "mysql2/promise";

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };  

  export default async function handler(req, res) {
    const conn = await mysql.createConnection(dbConfig);
  
    try {
      const { accid, brandid } = req.body;
  
      switch (req.method) {
        case "GET":
          const [rows] = await conn.execute(
            `SELECT b.brand_id, b.brandName 
             FROM FavBrand fb
             JOIN Brand b ON fb.brandid = b.brand_id
             WHERE fb.accid = ?`, [req.query.accid]
          );
          return res.status(200).json(rows);
  
        case "POST":
          await conn.execute(
            `INSERT INTO FavBrand (accid, brandid) VALUES (?, ?)`, 
            [accid, brandid]
          );
          return res.status(201).json({ message: "Brand added to favorites" });
  
        case "DELETE":
          await conn.execute(
            `DELETE FROM FavBrand WHERE accid = ? AND brandid = ?`, 
            [accid, brandid]
          );
          return res.status(200).json({ message: "Brand removed from favorites" });
  
        default:
          return res.status(405).json({ message: "Method Not Allowed" });
      }
    } catch (error) {
      console.error("API error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      conn.end();
    }
  }