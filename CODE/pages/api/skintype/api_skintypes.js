import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [skinTypes] = await connection.execute("SELECT * FROM SkinType");
    await connection.end();
    res.status(200).json(skinTypes);
  } catch (error) {
    console.error("Error fetching skin types:", error);
    res.status(500).json({ error: "Error fetching skin types", details: error.message });
  }
}
