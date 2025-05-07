import mysql from "mysql2/promise";
import { dbConfig } from "./admin/api_admin_account";

export default async function handler(req, res) {
    const db = await mysql.createConnection(dbConfig);

    if (req.method === "GET") {
        const [rows] = await db.query(`SELECT acc_id, accName, email, pwd, accRoles FROM account_skin`);
        await db.end();
        return res.status(200).json(rows);
    }

    if (req.method === "PUT") {
        const { acc_id, accRoles } = req.body;
        await db.execute(`UPDATE account_skin SET accRoles = ? WHERE acc_id = ?`, [accRoles, acc_id]);
        await db.end();
        return res.status(200).json({ message: "Role updated" });
    }

    if (req.method === "DELETE") {
        const { acc_id } = req.body;
        await db.execute(`DELETE FROM account_skin WHERE acc_id = ?`, [acc_id]);
        await db.end();
        return res.status(200).json({ message: "User deleted successfully" });
    }    

    res.status(405).json({ message: "Method not allowed" });
}
