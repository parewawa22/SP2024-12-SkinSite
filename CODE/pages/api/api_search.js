const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const { query = "", sort = "" } = req.query;
  const keywords = query.split(" ").map(k => `%${k}%`);

  const sortMap = {
    az: "pdName ASC",
    za: "pdName DESC",
    priceLow: "price ASC",
    priceHigh: "price DESC",
    rating: "avgRating DESC",
    reviewCount: "reviewCount DESC",
  };
  const orderBy = sortMap[sort] || "pdName ASC";

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT 
        p.pd_id,
        MAX(p.pdName) AS pdName,
        MAX(p.pdDescription) AS pdDescription,
        MAX(p.photo) AS photo,
        MAX(c.catName) AS catName,
        MAX(b.brandName) AS brandName,
        MAX(pr.price) AS price,
        MAX(s.volumn) AS volumn,
        MAX(s.unit) AS unit,
        COALESCE(r.avgRating, 0) AS avgRating,
        COALESCE(r.reviewCount, 0) AS reviewCount,
        GROUP_CONCAT(DISTINCT skt.sktName) AS sktNames,
        GROUP_CONCAT(DISTINCT con.concernName) AS concernNames,
        GROUP_CONCAT(DISTINCT ig.ingdName) AS ingredientNames,
        GROUP_CONCAT(DISTINCT bn.benefitName) AS benefitNames
      FROM Product p
      LEFT JOIN Category c ON p.catid = c.cat_id
      LEFT JOIN ProductInBrand pb ON p.pd_id = pb.pdid
      LEFT JOIN Brand b ON pb.brandid = b.brand_id
      LEFT JOIN Price pr ON p.pd_id = pr.pdid
      LEFT JOIN Size s ON pr.sizeid = s.size_id
      LEFT JOIN ProductSkinType ps ON p.pd_id = ps.pdid
      LEFT JOIN SkinType skt ON ps.sktid = skt.skt_id
      LEFT JOIN ConcernInProduct cp ON p.pd_id = cp.pdid
      LEFT JOIN Concern con ON cp.concernid = con.concern_id
      LEFT JOIN BenefitInProduct bp ON p.pd_id = bp.pdid
      LEFT JOIN Benefit bn ON bp.benefitid = bn.benefit_id
      LEFT JOIN IngdInProduct ip ON p.pd_id = ip.pdid
      LEFT JOIN Ingredient ig ON ip.ingdid = ig.ingd_id
      LEFT JOIN (
        SELECT 
          pdid,
          ROUND(AVG(scoreRating), 2) AS avgRating,
          COUNT(*) AS reviewCount
        FROM Review
        GROUP BY pdid
      ) r ON p.pd_id = r.pdid
      WHERE ${
        keywords.map(() => `
          p.pdName LIKE ? OR
          p.pdDescription LIKE ? OR
          c.catName LIKE ? OR
          b.brandName LIKE ? OR
          skt.sktName LIKE ? OR
          con.concernName LIKE ? OR
          pr.price LIKE ? OR
          s.volumn LIKE ? OR
          r.avgRating LIKE ? OR
          ig.ingdName LIKE ? OR
          bn.benefitName LIKE ?
        `).join(" OR ")
      }
      GROUP BY p.pd_id
      ORDER BY ${orderBy}
      `,
      keywords.flatMap(k => [k, k, k, k, k, k, k, k, k, k, k])
    );

    await connection.end();
    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ MySQL Search Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
