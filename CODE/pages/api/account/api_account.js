import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  let db;

  try {
    db = await mysql.createConnection(dbConfig);
    const { acc_id } = req.query;

    if (!acc_id || acc_id.trim() === "") {
      return res.status(400).json({ error: "Invalid or missing account ID" });
    }

    console.log(`Fetching account with acc_id: ${acc_id}`);

    if (req.method === "GET") {
      // Fetch account details
      const [accountRows] = await db.query(
        `SELECT acc_id, accName, email, accRoles, gender, dob, sktid 
         FROM account_skin 
         WHERE acc_id = ?`,
        [acc_id]
      );

      if (accountRows.length === 0) {
        console.error(`Account ID ${acc_id} not found in database.`);
        return res.status(404).json({ error: "Account not found" });
      }

      // Fetch wishlist items for the account
      const [wishlistRows] = await db.query(
        `SELECT w.pdid, p.pdName, p.pdDescription,
              COALESCE(p.photo, '/image/product.jpeg') AS photo, 
              DATE_FORMAT(w.dateAdd, '%Y-%m-%d') AS dateAdd 
         FROM wishlist w 
         JOIN Product p ON w.pdid = p.pd_id 
         WHERE w.accid = ?`,
        [acc_id]
      );

      console.log(`Returning data for acc_id: ${acc_id}`);

      const account = accountRows[0];

      // Skin Type
      const [skinTypeRows] = await db.query(
        `SELECT sktName FROM SkinType WHERE skt_id = ?`,
        [account.sktid]
      );

      // UserConcern details
      const [concernRows] = await db.query(`
    SELECT DISTINCT
      b.benefitName, c.concernName, i.ingdName
    FROM UserConcern u
    LEFT JOIN Benefit b ON u.benefitid = b.benefit_id
    LEFT JOIN Concern c ON u.concernid = c.concern_id
    LEFT JOIN Ingredient i ON u.ingdid = i.ingd_id
    WHERE u.accid = ?`, [acc_id]);

      const skinGoal = new Set();
      const preferenceConcern = new Set();
      const allergyIngredients = new Set();

      for (const row of concernRows) {
        if (row.benefitName) skinGoal.add(row.benefitName);
        if (row.concernName) preferenceConcern.add(row.concernName);
        if (row.ingdName) allergyIngredients.add(row.ingdName);
      }

      return res.status(200).json({
        account,
        skinType: skinTypeRows.length ? skinTypeRows[0].sktName : null,
        skinGoal: Array.from(skinGoal),
        preferenceConcern: Array.from(preferenceConcern),
        allergyIngredients: Array.from(allergyIngredients)
      });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  }
  catch (error) {
    console.error("Error fetching account data:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
  finally {
    if (db) await db.end();
  }
}
