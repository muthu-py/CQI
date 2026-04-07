/**
 * Computes Comparisons.
 * Pure function.
 * 
 * @param {Array<Object>} data - Massive flattened set of marks mapped with metadata context.
 * @param {Object} options
 * @param {boolean} options.batchSelected
 * @returns {Object} Computed average comparisons mathematically reduced.
 */
function generateComparison(data, options = {}) {
  const { batchSelected = false } = options;

  if (!Array.isArray(data) || data.length === 0) {
    return {
      internal_vs_external: {}, attendance_vs_performance: {},
      class_wise: {}, faculty_wise: {}, batch_wise: {}, regulation_wise: {},
      batch_pass_percentage: {}, batch_attendance_average: {}
    };
  }

  // Dictionaries tracking { total_marks: sum, count: int }
  const ivE = {};
  const aVSp = { '>90%': {s: 0, c: 0}, '80-90%': {s: 0, c: 0}, '70-80%': {s: 0, c: 0}, '<70%': {s: 0, c: 0} };
  const cW = {};
  const fW = {};
  const bW = {};
  const rW = {};
  const bPass = {};
  const bAtt = {};

  // Accumulator helper to safely sum up averages
  const add = (dict, key, marks) => {
    if (!key) key = 'Unknown';
    if (!dict[key]) dict[key] = { s: 0, c: 0 };
    dict[key].s += marks;
    dict[key].c += 1;
  };

  for (const row of data) {
    let marks = parseFloat(row.total_marks);
    if (isNaN(marks)) continue; // Can't draw comparisons if marks aren't valid
    const batchKey = row.batch_id || 'Unknown';
    const rawSection = row.section_name || row.section_id || 'Unknown';
    const sectionKey = batchSelected
      ? String(rawSection)
      : `Batch ${batchKey} - ${rawSection}`;

    add(ivE, row.exam_type, marks);
    add(cW, sectionKey, marks);
    add(fW, row.teacher_id, marks);
    add(bW, batchKey, marks);
    add(rW, row.regulation_id, marks);

    const max = parseFloat(row.max_marks);
    if (!isNaN(max) && max > 0) {
      if (!bPass[batchKey]) bPass[batchKey] = { pass: 0, total: 0 };
      const percentage = (marks / max) * 100;
      bPass[batchKey].total += 1;
      if (percentage >= 50) bPass[batchKey].pass += 1;
    }

    // Attendance Bucket Logic
    let att = parseFloat(row.attendance_percentage);
    if (!isNaN(att)) {
      add(bAtt, batchKey, att);
      if (att > 90) { aVSp['>90%'].s += marks; aVSp['>90%'].c += 1; }
      else if (att >= 80) { aVSp['80-90%'].s += marks; aVSp['80-90%'].c += 1; }
      else if (att >= 70) { aVSp['70-80%'].s += marks; aVSp['70-80%'].c += 1; }
      else { aVSp['<70%'].s += marks; aVSp['<70%'].c += 1; }
    }
  }

  // Reducer mapping function returning { "Key": AverageString }
  const avgReduce = (dict) => {
    const res = {};
    for (const k in dict) {
      if (dict[k].c > 0) {
        res[k] = Number((dict[k].s / dict[k].c).toFixed(2));
      }
    }
    return res;
  };

  const passReduce = (dict) => {
    const res = {};
    for (const k in dict) {
      if (dict[k].total > 0) {
        res[k] = Number(((dict[k].pass / dict[k].total) * 100).toFixed(2));
      }
    }
    return res;
  };

  return {
    internal_vs_external: avgReduce(ivE),
    attendance_vs_performance: avgReduce(aVSp),
    class_wise: avgReduce(cW),
    faculty_wise: avgReduce(fW),
    batch_wise: avgReduce(bW),
    regulation_wise: avgReduce(rW),
    batch_pass_percentage: passReduce(bPass),
    batch_attendance_average: avgReduce(bAtt)
  };
}

module.exports = {
  generateComparison
};
