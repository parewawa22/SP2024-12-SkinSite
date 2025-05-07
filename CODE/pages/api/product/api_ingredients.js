import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const { pdid, ingdName } = req.query;

  // ✅ If searching by product ID
  if (pdid) {
    try {
      const connection = await mysql.createConnection(dbConfig);

      const [ingredients] = await connection.execute(
        `
        SELECT 
          i.ingdName AS name,
          i.ingdRisk AS risk,
          i.dataAvailability AS ewg
        FROM IngdInProduct ip
        JOIN Ingredient i ON ip.ingdid = i.ingd_id
        WHERE ip.pdid = ?
        `,
        [pdid]
      );

      await connection.end();
      return res.status(200).json({ ingredients });
    } catch (error) {
      console.error("Error fetching ingredients by pdid:", error);
      return res.status(500).json({ error: "Failed to fetch ingredients." });
    }
  }

  // ✅ If searching by ingredient name
  if (ingdName) {
    try {
      const esResult = await elasticClient.search({
        index: "product",
        query: {
          match: {
            ingdName: {
              query: ingdName,
              fuzziness: "AUTO",
            },
          },
        },
      });

      const hits = esResult.hits.hits;
      if (hits.length > 0) {
        const products = hits.map((hit) => hit._source);
        return res.status(200).json({ products });
      }

      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `
        SELECT 
          Product.pd_id,
          Product.pdName,
          Brand.brandName,
          Category.catName,
          Ingredient.ingdName,
          Price.price,
          Size.volumn,
          Size.unit
        FROM Product
        LEFT JOIN ProductInBrand ON Product.pd_id = ProductInBrand.pdid
        LEFT JOIN Brand ON ProductInBrand.brandid = Brand.brand_id
        LEFT JOIN Category ON Product.catid = Category.cat_id
        LEFT JOIN Price ON Product.pd_id = Price.pdid
        LEFT JOIN Size ON Price.sizeid = Size.size_id
        LEFT JOIN IngdInProduct ON Product.pd_id = IngdInProduct.pdid
        LEFT JOIN Ingredient ON IngdInProduct.ingdid = Ingredient.ingd_id
        WHERE Ingredient.ingdName LIKE ?
        `,
        [`%${ingdName}%`]
      );

      await connection.end();
      return res.status(200).json({ products: rows });
    } catch (error) {
      console.error("Ingredient search error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: "Missing ingredient name (ingdName) or product ID (pdid)" });
}
