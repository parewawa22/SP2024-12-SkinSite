import mysql from "mysql2/promise";
import { dbConfig } from "./api_admin_account";

const tableMap = {
    Brand: "Brand",
    SkinType: "SkinType",
    Ingredient: "Ingredient",
    Category: "Category",
    Size: "Size",
    Benefit: "Benefit",
    Concern: "Concern",
};

export default async function handler(req, res) {
    const db = await mysql.createConnection(dbConfig);
    const rawType = (req.method === "DELETE" ? req.body.type : req.query.type || req.body?.type)?.trim(); 
    const type = rawType.charAt(0).toUpperCase() + rawType.slice(1); 

    const table = tableMap[type];


    if (!table) return res.status(400).json({ error: "Invalid type" });

    if (req.method === "GET") {
        const [rows] = await db.query(`SELECT * FROM ${table}`);
        await db.end();
        return res.status(200).json(rows);
    }

    if (req.method === "DELETE") {
        const { id } = req.body; 
        const keyInfo = await db.query(`SHOW KEYS FROM ${table} WHERE Key_name = 'PRIMARY'`);
        const primaryKey = keyInfo[0][0]?.Column_name;
    
        if (!primaryKey) {
            await db.end();
            return res.status(400).json({ error: "No primary key found" });
        }
    
        await db.execute(`DELETE FROM ${table} WHERE ${primaryKey} = ?`, [id]);
        await db.end();
        return res.status(200).json({ message: `${type} deleted.` });
    }    

    if (req.method === "POST") {
        const { type, values } = req.body;
        const table = tableMap[type];

        if (!table || !values || Object.keys(values).length === 0) {
            return res.status(400).json({ error: "Missing data or invalid type" });
        }

        const columns = Object.keys(values).join(", ");
        const placeholders = Object.keys(values).map(() => "?").join(", ");
        const insertValues = Object.values(values);

        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

        try {
            await db.execute(sql, insertValues);
            await db.end();
            return res.status(200).json({ message: `${type} added successfully` });
        } catch (err) {
            console.error(`Error inserting into ${table}:`, err);
            return res.status(500).json({ error: "Insert failed", message: err.message });
        }
    }

    if (req.method === "PUT") {
        const { type, values } = req.body;
        const table = tableMap[type];
        const primaryKeyQuery = await db.query(`SHOW KEYS FROM ${table} WHERE Key_name = 'PRIMARY'`);
        const primaryKey = primaryKeyQuery[0][0].Column_name;

        const fields = Object.keys(values).filter(key => key !== primaryKey);
        const updates = fields.map(key => `${key} = ?`).join(", ");
        const sql = `UPDATE ${table} SET ${updates} WHERE ${primaryKey} = ?`;

        const updateValues = [...fields.map(key => values[key]), values[primaryKey]];

        await db.execute(sql, updateValues);
        await db.end();
        return res.status(200).json({ message: `${type} updated.` });
    }

    if (!table) {
        console.error("❌ Invalid type received:", type);
        return res.status(400).json({ error: "Invalid type", received: type });
    }


    res.status(405).json({ error: "Method not allowed" });
}
