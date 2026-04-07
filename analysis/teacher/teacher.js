/**
 * Computes Teacher Performance.
 * Pure function.
 * 
 * @param {Array<Object>} data - Mass array pulling granular level question marks appended to teacher IDs
 * @returns {Array<Object>} Computed average score and CO attainment score mapped per teacher
 */
function computeTeacherPerformance(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const teacherBuckets = {};

  for (const row of data) {
    const tId = row.teacher_id || 'unknown_faculty';

    if (!teacherBuckets[tId]) {
      teacherBuckets[tId] = {
        teacher_id: row.teacher_id,
        total_gained: 0.0,
        total_offered: 0.0,
        co_gained: 0.0,
        co_offered: 0.0
      };
    }

    const obtained = parseFloat(row.marks_obtained);
    const max = parseFloat(row.max_marks);

    if (isNaN(max) || max <= 0) continue; // Bypass undefined scoring bounds logic safely

    const bucket = teacherBuckets[tId];
    // Baseline Class metric accumulation
    bucket.total_offered += max;
    bucket.total_gained += (!isNaN(obtained)) ? obtained : 0;

    // Strict Curriculum Mapping Accumulation evaluating specific effectiveness natively
    if (row.co_id) {
       bucket.co_offered += max;
       bucket.co_gained += (!isNaN(obtained)) ? obtained : 0;
    }
  }

  // Reduction mapping Phase processing final metric variables mathematically
  const results = [];
  
  for (const tId in teacherBuckets) {
    const bucket = teacherBuckets[tId];

    let avgScore = 0, coAttainment = 0;
    
    if (bucket.total_offered > 0) {
      avgScore = (bucket.total_gained / bucket.total_offered) * 100;
    }

    if (bucket.co_offered > 0) {
      coAttainment = (bucket.co_gained / bucket.co_offered) * 100;
    }

    results.push({
      teacher_id: bucket.teacher_id,
      avg_score: Number(avgScore.toFixed(2)),
      co_attainment_score: Number(coAttainment.toFixed(2))
    });
  }

  return results;
}

module.exports = {
  computeTeacherPerformance
};
