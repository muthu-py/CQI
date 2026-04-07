/**
 * Computes batch-level marks analysis, broken down per section.
 * Pure function — no side effects.
 *
 * @param {Array<Object>} data - Flat rows of student marks with section/batch metadata.
 * @returns {Object} Nested structure: { batches: { [batch_id]: { sections: { [section_name]: SectionData } } } }
 */
function computeBatchMarks(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { batches: {} };
  }

  // Accumulate per batch → section → students
  // Structure: acc[batchId][sectionName] = { studentMap: { [studentId]: { marks: [], max_marks_sum, obtained_sum } } }
  const acc = {};

  for (const row of data) {
    const batchId  = String(row.batch_id  ?? 'Unknown');
    const section  = String(row.section_name ?? row.section_id ?? 'Unknown');
    const studentId = String(row.student_id ?? 'Unknown');

    const obtained = parseFloat(row.total_marks);
    const max      = parseFloat(row.max_marks);

    if (isNaN(obtained) || isNaN(max) || max <= 0) continue;

    if (!acc[batchId]) acc[batchId] = {};
    if (!acc[batchId][section]) acc[batchId][section] = { studentMap: {} };

    const sectionData = acc[batchId][section];

    if (!sectionData.studentMap[studentId]) {
      sectionData.studentMap[studentId] = { obtained_sum: 0, max_sum: 0 };
    }

    sectionData.studentMap[studentId].obtained_sum += obtained;
    sectionData.studentMap[studentId].max_sum      += max;
  }

  // Reduce into final output
  const bucketLabels = ['0-10','10-20','20-30','30-40','40-50','50-60','60-70','70-80','80-90','90-100'];
  const emptyBuckets = () => Object.fromEntries(bucketLabels.map(b => [b, 0]));

  const batches = {};

  for (const [batchId, sectionsRaw] of Object.entries(acc)) {
    batches[batchId] = { sections: {} };

    for (const [sectionName, { studentMap }] of Object.entries(sectionsRaw)) {
      const distribution = emptyBuckets();
      let totalPct = 0;
      let passCount = 0;
      const students = [];

      for (const [studentId, { obtained_sum, max_sum }] of Object.entries(studentMap)) {
        if (max_sum <= 0) continue;
        const pct = (obtained_sum / max_sum) * 100;
        const clamped = Math.max(0, Math.min(100, pct));
        const floor = Math.floor(clamped / 10) * 10;
        const bucketStart = floor === 100 ? 90 : floor;
        const bucketKey = `${bucketStart}-${bucketStart + 10}`;

        if (distribution[bucketKey] !== undefined) distribution[bucketKey] += 1;

        totalPct += pct;
        if (pct >= 50) passCount += 1;

        students.push({
          student_id: studentId,
          percentage: Number(pct.toFixed(2))
        });
      }

      const count = students.length;
      batches[batchId].sections[sectionName] = {
        student_count: count,
        avg_percentage: count > 0 ? Number((totalPct / count).toFixed(2)) : 0,
        pass_count: passCount,
        pass_percentage: count > 0 ? Number(((passCount / count) * 100).toFixed(2)) : 0,
        distribution,
        students: students.sort((a, b) => a.student_id.localeCompare(b.student_id))
      };
    }
  }

  return { batches };
}

module.exports = { computeBatchMarks };
