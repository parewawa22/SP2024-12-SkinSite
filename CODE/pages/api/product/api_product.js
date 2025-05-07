import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    if (req.method === "GET") {
      const { pdid } = req.query;
      let rows = [];

      // ✅ Fetch a Single Product
      if (pdid) {
        console.log(`🔎 Searching for Product ID: ${pdid}`);

        [rows] = await db.query(
          `SELECT 
                p.pd_id, 
                p.pdName AS name, 
                p.pdDescription AS description, 
                p.pdusage, 
                IFNULL(NULLIF(p.FDA, ''), 'Not Available') AS FDA, 
                IFNULL(NULLIF(p.PAO, ''), 'Not Available') AS PAO, 
                IFNULL(p.photo, '/image/notfoundProduct.png') AS photo, 
                IFNULL(b.brandName, 'Unknown Brand') AS brand, 
                IFNULL(c.catName, 'No Category') AS category,

                -- Fetch Skin Types
                COALESCE(
                    (SELECT GROUP_CONCAT(DISTINCT st.sktName SEPARATOR ', ') 
                     FROM ProductSkinType pst 
                     JOIN SkinType st ON pst.sktid = st.skt_id 
                     WHERE pst.pdid = p.pd_id), 
                'Not Specified') AS skinType,

                -- Add this section for skin types
                COALESCE(
                    (SELECT GROUP_CONCAT(st.sktName SEPARATOR ', ')
                    FROM ProductSkinType pst
                    JOIN SkinType st ON pst.sktid = st.skt_id
                    WHERE pst.pdid = p.pd_id),
                'No Skin Types') AS skinTypes,

                -- Fetch Size
                COALESCE(
                    (SELECT CONCAT(s.volumn, ' ', s.unit) 
                     FROM Size s 
                     JOIN Price ps ON s.size_id = ps.sizeid 
                     WHERE ps.pdid = p.pd_id 
                     LIMIT 1), 
                'Not Available') AS size,

                -- Fetch Price
                COALESCE(
                    (SELECT ps.price 
                     FROM Price ps 
                     WHERE ps.pdid = p.pd_id 
                     LIMIT 1), 
                'Not Available') AS price,

                 -- Fetch Concerns
                COALESCE(
                    (SELECT GROUP_CONCAT(con.concernName SEPARATOR ', ')
                    FROM ConcernInProduct cip
                    JOIN Concern con ON cip.concernid = con.concern_id
                    WHERE cip.pdid = p.pd_id), 
                'No Concerns') AS concerns,

                -- Fetch Benefits
                COALESCE(
                    (SELECT GROUP_CONCAT(ben.benefitName SEPARATOR ', ')
                    FROM BenefitInProduct bip
                    JOIN Benefit ben ON bip.benefitid = ben.benefit_id
                    WHERE bip.pdid = p.pd_id), 
                'No Benefits') AS benefits

            FROM Product p
            LEFT JOIN ProductInBrand pb ON p.pd_id = pb.pdid
            LEFT JOIN Brand b ON pb.brandid = b.brand_id
            LEFT JOIN Category c ON c.cat_id = p.catid
            WHERE p.pd_id = ?;
            `,
          [pdid]
        );

        console.log("🟡 Query Result:", rows);

        if (rows.length === 0) {
          return res.status(404).json({ error: "Product not found." });
        }

        return res.status(200).json({
          product: rows[0],
        });
      }

      // ✅ Fetch All Products for Admin Panel
      else {
        [rows] = await db.query(
          `SELECT 
            p.pd_id, 
            p.pdName AS name, 
            p.pdDescription AS description, 
            p.pdusage, 
            IFNULL(p.FDA, 'Not Available') AS FDA, 
            IFNULL(p.PAO, 'Not Available') AS PAO, 
            p.photo, 
            IFNULL(b.brandName, 'Unknown Brand') AS brand, 
            IFNULL(c.cat_id, 'No Category') AS category_id, 
            IFNULL(c.catName, 'No Category') AS category,

            -- Fetch Wishlist Count
            (SELECT COUNT(*) FROM wishlist w WHERE w.pdid = p.pd_id) AS wishlistCount,

            -- Fetch Routine Set Count (Optimized Query)
            (SELECT COUNT(*) 
            FROM RoutineStep rs
            JOIN Step st ON rs.stepid = st.step_id 
            WHERE st.pdid = p.pd_id) AS routineSetCount,
            
            -- Fetch Skin Types
            COALESCE(
                (SELECT GROUP_CONCAT(DISTINCT st.sktName SEPARATOR ', ') 
                FROM ProductSkinType pst 
                JOIN SkinType st ON pst.sktid = st.skt_id 
                WHERE pst.pdid = p.pd_id), 
            'Not Specified') AS skinType,

            -- Add this section for skin types
            COALESCE(
                (SELECT GROUP_CONCAT(st.sktName SEPARATOR ', ')
                FROM ProductSkinType pst
                JOIN SkinType st ON pst.sktid = st.skt_id
                WHERE pst.pdid = p.pd_id),
            'No Skin Types') AS skinTypes,

            -- Fetch Size
            COALESCE(
                (SELECT CONCAT(s.volumn, ' ', s.unit) 
                FROM Size s 
                JOIN Price ps ON s.size_id = ps.sizeid 
                WHERE ps.pdid = p.pd_id 
                LIMIT 1), 
            'Not Available') AS size,

            -- Fetch Price
            COALESCE(
                (SELECT ps.price 
                FROM Price ps 
                WHERE ps.pdid = p.pd_id 
                LIMIT 1), 
            'Not Available') AS price,

            -- Fetch Ingredients
            COALESCE(
                (SELECT GROUP_CONCAT(DISTINCT i.ingdName SEPARATOR ', ') 
                FROM IngdInProduct ip 
                JOIN Ingredient i ON ip.ingdid = i.ingd_id 
                WHERE ip.pdid = p.pd_id), 
            'No Ingredients') AS ingredients,

            -- Fetch Benefits
            COALESCE(
                (SELECT GROUP_CONCAT(DISTINCT b.benefitName SEPARATOR ', ') 
                FROM BenefitInProduct bp 
                JOIN Benefit b ON bp.benefitid = b.benefit_id 
                WHERE bp.pdid = p.pd_id), 
            'No Benefits') AS benefits,

            -- Fetch Concerns
            COALESCE(
                (SELECT GROUP_CONCAT(DISTINCT con.concernName SEPARATOR ', ') 
                FROM ConcernInProduct cp 
                JOIN Concern con ON cp.concernid = con.concern_id 
                WHERE cp.pdid = p.pd_id), 
            'No Concerns') AS concerns

            FROM Product p
            LEFT JOIN ProductInBrand pb ON p.pd_id = pb.pdid
            LEFT JOIN Brand b ON pb.brandid = b.brand_id
            LEFT JOIN Category c ON c.cat_id = p.catid;
          `
        );

        return res.status(200).json({
          mysqlData: rows,
        });
      }
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  }
  catch (error) {
    console.error("❌ Error in API:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
  finally {
    if (db) {
      db.end().catch((err) => console.error("❌ Error closing DB connection:", err));
    }
  }
}

