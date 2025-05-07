export function calculateProductScore(ingredients, userSkinType, productSkinTypes = []) {
  if (!ingredients || ingredients.length === 0) {
    return { score: 0, breakdown: { riskScore: 0, availabilityScore: 0, skinTypeScore: 0 }, grade: 'F' };
  }

  // 1. Risk Score (50%)
  const validRiskIngredients = ingredients.filter(ing => ing.risk !== null);
  let riskScore = 0;
  if (validRiskIngredients.length > 0) {
    const normalizedRisks = validRiskIngredients.map(ing => (10 - ing.risk));
    const sumNormalizedRisks = normalizedRisks.reduce((sum, val) => sum + val, 0);
    const multipliedScore = sumNormalizedRisks * 10;
    const avgRisk = multipliedScore / validRiskIngredients.length;
    riskScore = avgRisk * 0.5; // 
  }

  // 2. Availability Score (40%)
  const validAvailability = ingredients.filter(ing => ing.ewg !== null);
  let availabilityScore = 0;
  if (validAvailability.length > 0) {
    const avgAvailability = (validAvailability.reduce((sum, ing) => sum + ing.ewg, 0) 
    / validAvailability.length)*10;
    availabilityScore = avgAvailability * 0.4; // max 40
  }

  // 3. Skin Type Score (10%)
  let skinTypeScore = 0;
  const userSkinTypes = userSkinType?.split('-').map(t => t.trim()) || [];

  if (userSkinTypes.length > 0 && productSkinTypes.length > 0) {
    const matched = userSkinTypes.filter(type => productSkinTypes.includes(type));
    skinTypeScore = Math.round((matched.length / userSkinTypes.length) * 10); // max 10
  }

  // Total Score
  const totalScore = Math.round(riskScore + availabilityScore + skinTypeScore);
  const grade = totalScore >= 80 ? 'A' :
                totalScore >= 60 ? 'B' :
                totalScore >= 40 ? 'C' :
                totalScore >= 20 ? 'D' : 'E';

  return {
    score: totalScore,
    breakdown: {
      riskScore: Math.round(riskScore),
      availabilityScore: Math.round(availabilityScore),
      skinTypeScore,
      totalIngredients: ingredients.length,
      validRiskCount: validRiskIngredients.length,
      validAvailabilityCount: validAvailability.length
    },
    grade
  };
}

export function calculateRiskCounts(ingredients) {
  return ingredients.reduce((counts, ing) => {
    if (ing.risk === null) {
      counts.unknown++;
    } else if (ing.risk <= 2) {
      counts.low++;
    } else if (ing.risk <= 5) {
      counts.moderate++;
    } else {
      counts.high++;
    }
    return counts;
  }, { low: 0, moderate: 0, high: 0, unknown: 0 });
}