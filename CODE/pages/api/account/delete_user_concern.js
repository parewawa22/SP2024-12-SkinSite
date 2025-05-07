import mysql from "mysql2/promise";
import { dbConfig } from "./api_account";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { accid, type, name } = req.body;

  if (!accid || !type || !name) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    let getIdQuery = "";
    let idField = "";

    if (type === "benefit") {
      getIdQuery = "SELECT benefit_id AS id FROM Benefit WHERE benefitName = ?";
      idField = "benefitid";
    } else if (type === "concern") {
      getIdQuery = "SELECT concern_id AS id FROM Concern WHERE concernName = ?";
      idField = "concernid";
    } else if (type === "ingredient") {
      getIdQuery = "SELECT ingd_id AS id FROM Ingredient WHERE ingdName = ?";
      idField = "ingdid";
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    // Get the actual ID from name
    const [[{ id } = {}]] = await db.query(getIdQuery, [name]);

    if (!id) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete from UserConcern
    await db.query(
      `DELETE FROM UserConcern WHERE accid = ? AND ${idField} = ?`,
      [accid, id]
    );

    return res.status(200).json({ message: "Deleted successfully" });

  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (db) await db.end();
  }
}
