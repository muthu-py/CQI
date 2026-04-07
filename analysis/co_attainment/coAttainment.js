/**
 * Computes CO Attainment.
 * Pure function.
 * 
 * @param {Array<Object>} data - Array containing STUDENT_QUESTION_MARKS, QUESTION, QUESTION_CO_PO_MAP
 * @returns {Array<Object>} Computed CO Attainment per CO
 */
function computeCoAttainment(data) {
  // Step 1: Input Validation
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Step 2: Grouping (Map Phase)
  const coGroups = {};

  for (const row of data) {
    // If co_id or co_number is missing, we can't map it. Skip safely.
    if (!row.co_id && !row.co_number) continue;

    // Use a composite key tracking regulation_id and batch_id logic boundaries
    const regId = row.regulation_id || 'unknown';
    const batchId = row.batch_id || 'unknown';
    const coSymbol = row.co_number || `CO_${row.co_id}`;
    
    // Create a strict cohort-isolated grouping key
    const coKey = `${batchId}_${regId}_${coSymbol}`;
    
    // Initialize the CO group if it doesn't exist
    if (!coGroups[coKey]) {
      coGroups[coKey] = {
        regulation_id: row.regulation_id,
        batch_id: row.batch_id,
        co_number: row.co_number,
        co_id: row.co_id,
        total_obtained_marks: 0,
        total_max_marks: 0
      };
    }

    // Safely parse numbers. Handle nulls or unexpected strings.
    const obtained = parseFloat(row.marks_obtained);
    const max = parseFloat(row.max_marks);

    // Only aggregate if max_marks is valid and > 0 to avoid division by zero
    if (!isNaN(max) && max > 0) {
      // If obtained is null/invalid but a question existed, treat their score as 0
      coGroups[coKey].total_max_marks += max;
      coGroups[coKey].total_obtained_marks += (!isNaN(obtained)) ? obtained : 0;
    }
  }

  // Step 3: Calculation (Reduce Phase)
  const result = [];
  
  for (const key in coGroups) {
    const group = coGroups[key];
    
    let attainmentPercentage = 0;
    if (group.total_max_marks > 0) {
      attainmentPercentage = (group.total_obtained_marks / group.total_max_marks) * 100;
    }

    // Step 4: Formatting the Output
    result.push({
      regulation_id: group.regulation_id,
      batch_id: group.batch_id,
      co_number: group.co_number,
      co_id: group.co_id,
      attainment_percentage: Number(attainmentPercentage.toFixed(2))
    });
  }

  // Standardize the output ordering hierarchically for the API response
  return result.sort((a, b) => {
    if (a.batch_id !== b.batch_id) return (Number(a.batch_id) || 0) - (Number(b.batch_id) || 0);
    if (a.regulation_id !== b.regulation_id) return (Number(a.regulation_id) || 0) - (Number(b.regulation_id) || 0);
    if (a.co_number && b.co_number) return a.co_number.localeCompare(b.co_number);
    return 0;
  });
}

module.exports = {
  computeCoAttainment
};
