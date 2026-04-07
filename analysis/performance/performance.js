/**
 * Computes performance metrics (internal, external, gap).
 * Pure function: strictly takes data and returns computed results.
 * 
 * @param {Array<Object>} data - Complete relational query linking component marks with exam contexts.
 * @returns {Object} Globally averaged Performance comparisons converted to precise percentages.
 */
function computePerformance(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      internal_score: 0.0,
      external_score: 0.0,
      performance_gap: 0.0
    };
  }

  let internalSum = 0, internalCount = 0;
  let externalSum = 0, externalCount = 0;

  for (const row of data) {
    const obtained = parseFloat(row.total_marks);
    const max = parseFloat(row.max_marks);

    // Skip invalid rows seamlessly bypassing db constraints or absent entries
    if (isNaN(obtained) || isNaN(max) || max <= 0) continue;

    // Convert purely to 0-100 Percentages ensuring apple-to-apple math
    const percentage = (obtained / max) * 100;
    
    // Evaluate component categorization strings (making it extremely immune to case sensitivity anomalies)
    const type = (row.exam_type || '').toString().toLowerCase();

    if (type.includes('internal')) {
      internalSum += percentage;
      internalCount += 1;
    } else if (type.includes('external')) {
      externalSum += percentage;
      externalCount += 1;
    }
  }

  const intScore = internalCount > 0 ? (internalSum / internalCount) : 0;
  const extScore = externalCount > 0 ? (externalSum / externalCount) : 0;
  const gap = Math.abs(intScore - extScore);

  return {
    internal_score: Number(intScore.toFixed(2)),
    external_score: Number(extScore.toFixed(2)),
    performance_gap: Number(gap.toFixed(2))
  };
}

module.exports = {
  computePerformance
};
