import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== "PUT" && req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    pdid,
    pdName,
    pdDescription,
    pdusage,
    FDA,
    PAO,
    ingredientIds,
    catid,
    brandId,
    price,
    skinTypeNames,
    sizeInput,
  } = req.body;

  if (!pdid) {
    return res.status(400).json({ message: "Missing pdid (product ID)" });
  }

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    if (req.method === "PUT") {
      const updateFields = [
        "pdName = ?",
        "pdDescription = ?",
        "pdusage = ?",
        "FDA = ?",
        "PAO = ?"
      ];
      const updateValues = [pdName, pdDescription, pdusage, FDA, PAO];

      if (catid !== undefined) {
        updateFields.push("catid = ?");
        updateValues.push(catid);
      }

      updateValues.push(pdid); 

      const sql = `
        UPDATE Product
        SET ${updateFields.join(", ")}
        WHERE pd_id = ?
      `;

      await db.execute(sql, updateValues);

      if (brandId !== undefined) {
        await db.execute(`DELETE FROM ProductInBrand WHERE pdid = ?`, [pdid]);
        await db.execute(`INSERT INTO ProductInBrand (brandid, pdid) VALUES (?, ?)`, [brandId, pdid]);
      }

      await db.execute(`DELETE FROM IngdInProduct WHERE pdid = ?`, [pdid]);

      if (Array.isArray(ingredientIds)) {
        for (const ingd_id of ingredientIds) {
          await db.execute(
            `INSERT INTO IngdInProduct (pdid, ingdid) VALUES (?, ?)`,
            [pdid, ingd_id]
          );
        }
      }

      if (Array.isArray(skinTypeNames)) {
        await db.execute(`DELETE FROM ProductSkinType WHERE pdid = ?`, [pdid]);

        for (const name of skinTypeNames) {
          const [rows] = await db.execute(`SELECT skt_id FROM SkinType WHERE sktName = ?`, [name]);
          if (rows.length > 0) {
            console.log("Received skinTypeNames:", skinTypeNames);
            await db.execute(`INSERT INTO ProductSkinType (pdid, sktid) VALUES (?, ?)`, [pdid, rows[0].skt_id]);
          }
        }
      }

      let size_id = null;
      if (sizeInput && sizeInput.trim() !== "") {
        const parts = sizeInput.trim().split(" ");
        const vol = parseFloat(parts[0]);
        const unit = parts.slice(1).join(" ");

        const [existingSizeRow] = await db.execute(
          `SELECT size_id FROM Size WHERE volumn = ? AND unit = ?`,
          [vol, unit]
        );

        if (existingSizeRow.length > 0) {
          size_id = existingSizeRow[0].size_id;
        } else {
          size_id = `SIZE${Date.now()}`;
          await db.execute(
            `INSERT INTO Size (size_id, volumn, unit) VALUES (?, ?, ?)`,
            [size_id, vol, unit]
          );
        }

        await db.execute(
          `UPDATE Price SET sizeid = ? WHERE pdid = ?`,
          [size_id, pdid]
        );
      }

      if (price !== undefined && price !== "") {
        if (!size_id) {
          const [currentSizeRow] = await db.execute(
            `SELECT sizeid FROM Price WHERE pdid = ? LIMIT 1`,
            [pdid]
          );
          if (currentSizeRow.length > 0) {
            size_id = currentSizeRow[0].sizeid;
          }
        }

        if (size_id) {
          await db.execute(
            `UPDATE Price SET price = ? WHERE pdid = ? AND sizeid = ?`,
            [price, pdid, size_id]
          );
        }
      }

      if (price !== undefined) {
        if (!size_id) {
          const [currentSizeRow] = await db.execute(
            `SELECT sizeid FROM Price WHERE pdid = ? LIMIT 1`,
            [pdid]
          );
          if (currentSizeRow.length > 0) {
            size_id = currentSizeRow[0].sizeid;
          }
        }

        if (size_id) {
          await db.execute(
            `UPDATE Price SET price = ? WHERE pdid = ? AND sizeid = ?`,
            [price, pdid, size_id]
          );
        }
      }

      return res.status(200).json({ message: "Product updated successfully" });
    }

    if (req.method === "DELETE") {
      await db.execute(`DELETE FROM IngdInProduct WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM ProductInBrand WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM ProductSkinType WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM Wishlist WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM Review WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM Price WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM ConcernInProduct WHERE pdid = ?`, [pdid]);
      await db.execute(`DELETE FROM BenefitInProduct WHERE pdid = ?`, [pdid]);

      await db.execute(`DELETE FROM Product WHERE pd_id = ?`, [pdid]);

      return res.status(200).json({ message: "Product deleted successfully" });
    }

  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  } finally {
    if (db) await db.end();
  }
}

