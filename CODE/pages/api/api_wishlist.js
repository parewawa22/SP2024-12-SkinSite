import mysql from "mysql2/promise";

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export default async function handler(req, res) {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);

        // GET: Fetch wishlist or check wishlist status
        if (req.method === 'GET') {
            const { accid, pdid } = req.query;

            if (!accid) {
                return res.status(400).json({ message: "Account ID (accid) is required" });
            }

            // Check if item is in wishlist
            if (pdid) {
                const [checkResult] = await connection.query(
                    'SELECT * FROM wishlist WHERE accid = ? AND pdid = ?',
                    [accid, pdid]
                );
                return res.status(200).json({
                    isInWishlist: checkResult.length > 0
                });
            }

            // Fetch entire wishlist
            console.log("Fetching wishlist for accid:", accid);

            const query = `
                SELECT 
                    p.pd_id AS pd_id,
                    p.pdName AS name, 
                    p.pdDescription AS description,
                    COALESCE((SELECT CONCAT(s.volumn, ' ', s.unit) 
                            FROM Size s 
                            JOIN Price ps ON s.size_id = ps.sizeid 
                            WHERE ps.pdid = p.pd_id 
                            LIMIT 1), 
                            'Not Available') AS size,
                    COALESCE((SELECT ps.price 
                            FROM Price ps 
                            WHERE ps.pdid = p.pd_id 
                            LIMIT 1), 
                            'Not Available') AS price,
                    COALESCE((SELECT GROUP_CONCAT(DISTINCT i.ingdName SEPARATOR ', ') 
                            FROM IngdInProduct ip 
                            JOIN Ingredient i ON ip.ingdid = i.ingd_id 
                            WHERE ip.pdid = p.pd_id), 
                            'No Ingredients') AS ingredients,
                    COALESCE((SELECT GROUP_CONCAT(DISTINCT b.benefitName SEPARATOR ', ') 
                            FROM BenefitInProduct bp 
                            JOIN Benefit b ON bp.benefitid = b.benefit_id 
                            WHERE bp.pdid = p.pd_id), 
                            'No Benefits') AS benefits,
                    COALESCE((SELECT GROUP_CONCAT(DISTINCT con.concernName SEPARATOR ', ') 
                            FROM ConcernInProduct cp 
                            JOIN Concern con ON cp.concernid = con.concern_id 
                            WHERE cp.pdid = p.pd_id), 
                            'No Concerns') AS concerns,
                    COALESCE(p.photo, '/image/ProductImage/notfoundProduct.png') AS photo,
                    IFNULL(b.brandName, 'Unknown Brand') AS brand
                FROM wishlist w
                INNER JOIN account_skin a ON w.accid = a.acc_id
                INNER JOIN Product p ON w.pdid = p.pd_id
                LEFT JOIN ProductInBrand pb ON p.pd_id = pb.pdid
                LEFT JOIN Brand b ON pb.brandid = b.brand_id
                WHERE w.accid = ?;
            `;

            const [rows] = await connection.query(query, [accid]);

            if (rows.length === 0) {
                return res.status(200).json({ message: "No wishlist items found", data: [] });
            }

            return res.status(200).json({ data: rows });
        }

        // DELETE: Remove from wishlist
        if (req.method === 'DELETE') {
            const { accid, pdid } = req.query;

            if (!accid || !pdid) {
                return res.status(400).json({ 
                    success: false,
                    message: "Missing accid or pdid" 
                });
            }

            const [result] = await connection.execute(
                'DELETE FROM wishlist WHERE accid = ? AND pdid = ?',
                [accid, pdid]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found in wishlist"
                });
            }

            return res.status(200).json({ 
                success: true,
                message: "Removed from wishlist successfully"
            });
        }

        // POST: Add to wishlist
        if (req.method === 'POST') {
            const { accid, pdid } = req.body;
            
            // Add logging to debug
            console.log('Adding to wishlist:', { accid, pdid });

            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            await connection.execute(
                'INSERT INTO wishlist (pdid, accid, dateAdd) VALUES (?, ?, ?)',
                [pdid, accid, currentDate]
            );

            // Verify the insert
            const [result] = await connection.execute(
                'SELECT * FROM wishlist WHERE accid = ? AND pdid = ?',
                [accid, pdid]
            );
            console.log('Insert result:', result);

            return res.status(200).json({ 
                message: "Added to wishlist successfully",
                data: result[0]
            });
        }

        return res.status(405).json({ message: "Method Not Allowed" });
    }
    catch (error) {
        console.error('Database operation failed:', error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    } finally {
        if (connection) await connection.end();
    }
}

export const config = {
    api: {
        bodyParser: true,
    },

  };



