import mysql from 'mysql2/promise';
import { dbConfig } from "../account/api_account";

export default async function handler(req, res) {
  const { pdid, accid, type } = req.query;

  if (!pdid) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // For skin type matching (former api_skintype_match.js)
    if (type === 'match') {
      const [skinTypes] = await connection.execute(`
        SELECT DISTINCT 
          st.skt_id,
          st.sktName
        FROM ProductSkinType pst
        JOIN SkinType st ON pst.sktid = st.skt_id
        WHERE pst.pdid = ?
        ORDER BY st.sktName
      `, [pdid]);

      return res.status(200).json(skinTypes);
    }

    // For skin type scoring (former api_skintype_score.js)
    if (type === 'score' && accid) {
      // 1. Get user's skin type
      const [userSkinType] = await connection.execute(`
        SELECT st.sktName, st.skt_id
        FROM account_skin a
        JOIN SkinType st ON a.sktid = st.skt_id
        WHERE a.acc_id = ?
      `, [accid]);

      if (!userSkinType.length) {
        return res.status(200).json({
          skinTypeScore: 0,
          message: 'User skin type not found'
        });
      }

      // 2. Get product's skin types
      const [productSkinTypes] = await connection.execute(`
        SELECT st.sktName
        FROM ProductSkinType pst
        JOIN SkinType st ON pst.sktid = st.skt_id
        WHERE pst.pdid = ?
      `, [pdid]);

      const userSkinTypeName = userSkinType[0].sktName;
      const productSkinTypeNames = productSkinTypes.map(st => st.sktName);

      // 3. Calculate score based on skin type compatibility
      let skinTypeScore = 0;
      let message = '';

      // Handle Combination skin
      if (userSkinTypeName === 'Combination') {
        const requiredTypes = ['Normal', 'Oily', 'Dry'];
        const hasAllRequired = requiredTypes.every(type => 
          productSkinTypeNames.includes(type)
        );
        skinTypeScore = hasAllRequired ? 10 : 0;
        message = hasAllRequired 
          ? 'Product is suitable for combination skin' 
          : 'Product does not meet combination skin requirements';
      }
      // Handle Sensitive skin
      else if (userSkinTypeName === 'Sensitive') {
        const isSensitiveSafe = productSkinTypeNames.includes('Sensitive');
        skinTypeScore = isSensitiveSafe ? 10 : 0;
        message = isSensitiveSafe 
          ? 'Product is safe for sensitive skin' 
          : 'Product is not formulated for sensitive skin';
      }
      // Handle Acne-prone skin
      else if (userSkinTypeName === 'Acne-prone') {
        const isAcneSafe = productSkinTypeNames.includes('Acne-prone');
        skinTypeScore = isAcneSafe ? 10 : 0;
        message = isAcneSafe 
          ? 'Product is suitable for acne-prone skin' 
          : 'Product is not specifically formulated for acne-prone skin';
      }
      // Handle other skin types
      else {
        const isCompatible = productSkinTypeNames.includes(userSkinTypeName);
        skinTypeScore = isCompatible ? 10 : 0;
        message = isCompatible 
          ? `Product is compatible with ${userSkinTypeName} skin` 
          : `Product is not specifically designed for ${userSkinTypeName} skin`;
      }

      return res.status(200).json({
        skinTypeScore,
        compatibleTypes: productSkinTypeNames,
        userSkinType: userSkinTypeName,
        message
      });
    }

    return res.status(400).json({ error: 'Invalid request type' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Operation failed', details: error.message });
  } finally {
    if (connection) await connection.end();
  }
}