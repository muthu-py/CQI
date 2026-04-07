/**
 * Computes Attendance metric.
 * Pure function.
 * 
 * @param {Array<Object>} data - Array containing matched attendance percentages and their regulation weightages.
 * @returns {Array<Object>} Computed weighted attendance score per student
 */
function computeAttendance(data) {
  // Step 1: Input validation
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Step 2: Map / Accumulate Phase
  const studentGroups = {};

  for (const row of data) {
    const sId = row.student_id;
    if (!sId) continue; // safety skip

    // Initialize map track
    if (!studentGroups[sId]) {
      studentGroups[sId] = {
        student_id: sId,
        weighted_score: 0.0
      };
    }

    // Safely parse
    let percentage = parseFloat(row.attendance_percentage);
    if (isNaN(percentage)) percentage = 0; // Treatment for null/absent metrics

    let weight = parseFloat(row.weightage);
    if (isNaN(weight)) weight = 0;

    // Step 3: Pure Math (Sum of components)
    studentGroups[sId].weighted_score += (percentage * weight);
  }

  // Step 4: Reduction & Formatting
  const result = [];
  for (const sId in studentGroups) {
    const record = studentGroups[sId];
    result.push({
      student_id: record.student_id,
      weighted_score: Number(record.weighted_score.toFixed(2))
    });
  }

  // Ensure deterministic sort ordering by student_id
  return result.sort((a, b) => a.student_id - b.student_id);
}

module.exports = {
  computeAttendance
};
