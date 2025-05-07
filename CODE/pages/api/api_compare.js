import mysql from 'mysql2/promise';
import { dbConfig } from "./account/api_account";

export default async function handler(req, res) {
  const { products, category } = req.query;

  if (!products) {
    return res.status(400).json({ error: 'Product IDs required' });
  }

  const productIds = products.split(',');
  let sharedCategory = category || null;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    if (category) {
      const [catRows] = await connection.execute(
        'SELECT cat_id FROM Category WHERE catName = ? LIMIT 1',
        [category]
      );
      if (catRows.length > 0) {
        sharedCategory = catRows[0].cat_id;
      } else {
        console.warn('No matching category ID found for name:', category);
      }
    }

    const placeholders = productIds.map(() => '?').join(',');

    const query = `
      SELECT DISTINCT 
        p.pd_id,
        p.pdName as name,
        p.photo,
        b.brandName as brand,
        c.catName as category,
        COUNT(DISTINCT CASE 
          WHEN bp.benefitid IN (
            SELECT benefitid FROM BenefitInProduct WHERE pdid IN (${placeholders})
          ) THEN bp.benefitid 
        END) as benefit_matches,
        COUNT(DISTINCT CASE 
          WHEN ip.ingdid IN (
            SELECT ingdid FROM IngdInProduct WHERE pdid IN (${placeholders})
          ) THEN ip.ingdid 
        END) as ingredient_matches
      FROM Product p
      LEFT JOIN ProductInBrand pb ON p.pd_id = pb.pdid
      LEFT JOIN Brand b ON pb.brandid = b.brand_id
      LEFT JOIN Category c ON p.catid = c.cat_id
      LEFT JOIN BenefitInProduct bp ON p.pd_id = bp.pdid
      LEFT JOIN IngdInProduct ip ON p.pd_id = ip.pdid
      WHERE p.pd_id NOT IN (${placeholders})
      ${sharedCategory ? 'AND p.catid = ?' : ''}
      GROUP BY p.pd_id, p.pdName, p.photo, b.brandName, c.catName
      HAVING benefit_matches > 0 OR ingredient_matches > 0
      ORDER BY 
        ${sharedCategory ? 'p.catid = ? DESC,' : ''}
        (benefit_matches + ingredient_matches) DESC
      LIMIT 10
    `;

    const queryParams = [
      ...productIds,       
      ...productIds,      
      ...productIds,       
      ...(sharedCategory ? [sharedCategory, sharedCategory] : [])
    ];

    const [similarProducts] = await connection.execute(query, queryParams);

    return res.status(200).json({ similarProducts });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch similar products' });
  } finally {
    if (connection) await connection.end();
  }
}