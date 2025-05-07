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
    const [concerns] = await connection.execute("SELECT * FROM Concern");
    res.status(200).json(concerns);
  } 
  catch (error) {
    res.status(500).json({ error: "Error fetching concerns", details: error.message });
  }
}