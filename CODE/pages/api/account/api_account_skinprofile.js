import mysql from "mysql2/promise";

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export default async function handler(req, res) {
    const { acc_id } = req.query;

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    if (!acc_id) {
        return res.status(400).json({ message: "Missing acc_id parameter" });
    }

    let db;

    try {
        db = await mysql.createConnection(dbConfig);

        // Fetch Skin Type from account_skin
        const [skinTypeRows] = await db.query(
            `SELECT st.sktName 
         FROM account_skin a
         JOIN SkinType st ON a.sktid = st.skt_id
         WHERE a.acc_id = ?`,
            [acc_id]
        );

        const skinType = skinTypeRows.length > 0 ? skinTypeRows[0].sktName : null;

        // Fetch UserConcern joined with Benefit, Concern, Ingredient
        const [userConcernRows] = await db.query(
            `SELECT 
         b.benefitName, 
         c.concernName, 
         i.ingdName
       FROM UserConcern uc
       LEFT JOIN Benefit b ON uc.benefitid = b.benefit_id
       LEFT JOIN Concern c ON uc.concernid = c.concern_id
       LEFT JOIN Ingredient i ON uc.ingdid = i.ingd_id
       WHERE uc.accid = ?`,
            [acc_id]
        );

        // Separate data into arrays
        const skinGoals = [];
        const concerns = [];
        const ingredients = [];

        userConcernRows.forEach(row => {
            if (row.benefitName && !skinGoals.includes(row.benefitName)) {
                skinGoals.push(row.benefitName);
            }
            if (row.concernName && !concerns.includes(row.concernName)) {
                concerns.push(row.concernName);
            }
            if (row.ingdName && !ingredients.includes(row.ingdName)) {
                ingredients.push(row.ingdName);
            }
        });

        return res.status(200).json({
            skinType,
            skinGoals,
            concerns,
            ingredients,
        });

    } catch (error) {
        console.error("Error fetching skin profile:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (db) await db.end();
    }
}
