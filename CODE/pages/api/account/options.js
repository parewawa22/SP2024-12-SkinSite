import mysql from "mysql2/promise";
import { dbConfig } from "./api_account";

export default async function handler(req, res) {
  const { type } = req.query;
  let db = await mysql.createConnection(dbConfig);

  let query = "";
  if (type === "benefit") query = "SELECT benefit_id AS id, benefitName AS name FROM Benefit";
  else if (type === "concern") query = "SELECT concern_id AS id, concernName AS name FROM Concern";
  else if (type === "ingredient") query = "SELECT ingd_id AS id, ingdName AS name FROM Ingredient";
  else return res.status(400).json({ error: "Invalid type" });

  const [rows] = await db.query(query);
  res.status(200).json({ options: rows });
}
