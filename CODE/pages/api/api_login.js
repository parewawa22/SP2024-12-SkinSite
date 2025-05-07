import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, password } = req.body;

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const [rows] = await connection.execute(
            "SELECT * FROM account_skin WHERE email = ? AND pwd = ?",
            [email, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            res.status(200).json({
                success: true, 
                acc_id: user.acc_id,
                accName: user.accName,
                accRoles: user.accRoles,
            });
        }
        else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error: error.message });
    } finally {
        if (connection) await connection.end();
    }
}