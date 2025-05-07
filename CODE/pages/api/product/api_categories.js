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
    const [categories] = await connection.execute("SELECT * FROM Category");

    console.log("✅ Fetched categories:", categories); 
    res.status(200).json(categories);
  }
  catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ error: "Error fetching categories", details: error.message });
  }
}
