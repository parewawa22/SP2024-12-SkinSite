import mysql from "mysql2/promise";
import { dbConfig } from "./api_admin_account";

export default async function handler(req, res) {
    if (req.method !== "PUT") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { pdid, brand_id } = req.body;
  
    if (!pdid || !brand_id) {
      return res.status(400).json({ error: "Missing pdid or brand_id" });
    }
  
    const db = await mysql.createConnection(dbConfig);
    try {
      await db.query(`DELETE FROM ProductInBrand WHERE pdid = ?`, [pdid]);
  
      await db.query(`INSERT INTO ProductInBrand (brandid, pdid) VALUES (?, ?)`, [brand_id, pdid]);
  
      res.status(200).json({ message: "Brand updated for product" });
    } catch (error) {
      console.error("❌ Error updating brand in product:", error);
      res.status(500).json({ error: "Failed to update brand" });
    } finally {
      db.end();
    }
  }
