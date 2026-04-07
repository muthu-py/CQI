/**
 * Computes batch-level attendance analysis, broken down per section.
 * Pure function — no side effects.
 *
 * @param {Array<Object>} data - Flat rows of student attendance with section/batch metadata and regulation weightage.
 * @returns {Object} Nested structure: { batches: { [batch_id]: { sections: { [section_name]: SectionData } } } }
 */
function computeBatchAttendance(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { batches: {} };
  }

  // Accumulate weighted attendance per student, per batch → section
  // Structure: acc[batchId][sectionName] = { studentMap: { [studentId]: { weighted_score: float } } }
  const acc = {};

  for (const row of data) {
    const batchId   = String(row.batch_id   ?? 'Unknown');
    const section   = String(row.section_name ?? row.section_id ?? 'Unknown');
    const studentId = String(row.student_id ?? 'Unknown');

    let percentage = parseFloat(row.attendance_percentage);
    if (isNaN(percentage)) percentage = 0;

    let weight = parseFloat(row.weightage);
    if (isNaN(weight)) weight = 0;

    if (!acc[batchId]) acc[batchId] = {};
    if (!acc[batchId][section]) acc[batchId][section] = { studentMap: {} };

    const sectionData = acc[batchId][section];

    if (!sectionData.studentMap[studentId]) {
      sectionData.studentMap[studentId] = { weighted_score: 0, total_weight: 0 };
    }

    // Accumulate the products and total weight to calculate weighted average later
    sectionData.studentMap[studentId].weighted_score += percentage * weight;
    sectionData.studentMap[studentId].total_weight += weight;
  }

  // Reduce into final output
  const bucketLabels = ['0-10','10-20','20-30','30-40','40-50','50-60','60-70','70-80','80-90','90-100'];
  const emptyBuckets = () => Object.fromEntries(bucketLabels.map(b => [b, 0]));

  const batches = {};

  for (const [batchId, sectionsRaw] of Object.entries(acc)) {
    batches[batchId] = { sections: {} };

    for (const [sectionName, { studentMap }] of Object.entries(sectionsRaw)) {
      const distribution = emptyBuckets();
      let totalScore = 0;
      let below75Count = 0;
      let below60Count = 0;
      const students = [];

      for (const [studentId, { weighted_score, total_weight }] of Object.entries(studentMap)) {
        const finalScore = total_weight > 0 ? weighted_score / total_weight : 0;
        const score = Number(finalScore.toFixed(2));
        const clamped = Math.max(0, Math.min(100, score));
        const floor = Math.floor(clamped / 10) * 10;
        const bucketStart = floor === 100 ? 90 : floor;
        const bucketKey = `${bucketStart}-${bucketStart + 10}`;

        if (distribution[bucketKey] !== undefined) distribution[bucketKey] += 1;

        totalScore += score;
        if (score < 75) below75Count += 1;
        if (score < 60) below60Count += 1;

        students.push({
          student_id: studentId,
          weighted_score: score
        });
      }

      const count = students.length;
      batches[batchId].sections[sectionName] = {
        student_count: count,
        avg_attendance: count > 0 ? Number((totalScore / count).toFixed(2)) : 0,
        below_75_count: below75Count,
        below_60_count: below60Count,
        below_75_percentage: count > 0 ? Number(((below75Count / count) * 100).toFixed(2)) : 0,
        distribution,
        students: students.sort((a, b) => a.student_id.localeCompare(b.student_id))
      };
    }
  }

  return { batches };
}

module.exports = { computeBatchAttendance };
