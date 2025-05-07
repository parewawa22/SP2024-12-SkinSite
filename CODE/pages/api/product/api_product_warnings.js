import mysql from 'mysql2/promise';
import { dbConfig } from "../account/api_account";

export default async function handler(req, res) {
  const { pdid, accid } = req.query;

  if (!pdid || !accid) {
    return res.status(400).json({ error: 'Product ID and Account ID required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Get user's concerns and allergies from UserConcern
    const [userPreferences] = await connection.execute(`
      SELECT 
        c.concernName as concern,
        i.ingdName as allergen,
        i.ingd_id as allergen_id
      FROM UserConcern uc
      LEFT JOIN Concern c ON uc.concernid = c.concern_id
      LEFT JOIN Ingredient i ON uc.ingdid = i.ingd_id
      WHERE uc.accid = ?
    `, [accid]);

    // 2. Get product's actual ingredients and concerns
    const [productDetails] = await connection.execute(`
      SELECT DISTINCT
        c.concernName as concern,
        i.ingdName as ingredient,
        i.ingd_id as ingredient_id
      FROM Product p
      LEFT JOIN ConcernInProduct cp ON p.pd_id = cp.pdid
      LEFT JOIN Concern c ON cp.concernid = c.concern_id
      LEFT JOIN IngdInProduct ip ON p.pd_id = ip.pdid
      LEFT JOIN Ingredient i ON ip.ingdid = i.ingd_id
      WHERE p.pd_id = ?
    `, [pdid]);

    const warnings = {
      concerns: new Set(),
      allergens: new Set(),
      hasWarning: false
    };

    // Check only ingredients that exist in the product
    userPreferences.forEach(userPref => {
      // Check concerns
      if (userPref.concern) {
        const matchingConcern = productDetails.find(prod => prod.concern === userPref.concern);
        if (matchingConcern) {
          warnings.concerns.add(userPref.concern);
          warnings.hasWarning = true;
        }
      }
      // Check allergens
      if (userPref.allergen_id) {
        const matchingIngredient = productDetails.find(prod => 
          prod.ingredient_id === userPref.allergen_id
        );
        if (matchingIngredient) {
          warnings.allergens.add(userPref.allergen);
          warnings.hasWarning = true;
        }
      }
    });

    return res.status(200).json({
      concerns: Array.from(warnings.concerns),
      allergens: Array.from(warnings.allergens),
      hasWarning: warnings.hasWarning
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to check warnings' });
  } finally {
    if (connection) await connection.end();
  }
}