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
    const [brands] = await connection.execute("SELECT * FROM Brand");
    res.status(200).json(brands);
  } 
  catch (error) {
    res.status(500).json({ error: "Error fetching brands", details: error.message });
  }
}