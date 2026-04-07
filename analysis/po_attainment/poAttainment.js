/**
 * Computes Program Outcome (PO) Attainment.
 * Pure function linearly converting component fractional marking limits exactly translating towards PO mapping algorithms.
 * 
 * @param {Array} data - Array of granular mapped testing records natively linking Student test points to PO mapping rules structurally.
 * @returns {Array} Computed percentage attainment cleanly sorted sequentially by PO numbers and batches.
 */
function computePoAttainment(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  const poGroups = {};
  
  for (const row of data) {
    if (!row.po_id) continue;

    const regId = row.regulation_id || 'unknown';
    const batchId = row.batch_id || 'unknown';
    const subId = row.subject_id || 'unknown';
    const poNum = row.po_number || `PO_${row.po_id}`;
    
    // Generates an isolated boundary container preventing identical numbers across distinct cohorts functionally crossing logic bounds
    const poKey = `${batchId}_${regId}_${subId}_${poNum}`;
    
    if (!poGroups[poKey]) {
      poGroups[poKey] = {
        regulation_id: row.regulation_id,
        batch_id: row.batch_id,
        subject_id: row.subject_id,
        po_id: row.po_id,
        po_number: poNum,
        total_obtained: 0,
        total_max_scaled: 0
      };
    }

    const obtained = parseFloat(row.marks_obtained);
    const max = parseFloat(row.max_marks);
    const weight = parseFloat(row.weightage);

    if (isNaN(max) || max <= 0 || isNaN(weight) || weight <= 0) continue;

    const obtainedPercentage = (!isNaN(obtained) ? obtained : 0) / max;
    
    // Scale mathematically adjusting score natively
    poGroups[poKey].total_obtained += obtainedPercentage * weight;
    poGroups[poKey].total_max_scaled += weight;
  }

  const results = [];
  
  for (const key in poGroups) {
    const group = poGroups[key];
    
    let attainmentPercentage = 0;
    if (group.total_max_scaled > 0) {
      attainmentPercentage = (group.total_obtained / group.total_max_scaled) * 100;
    }

    results.push({
      regulation_id: group.regulation_id,
      batch_id: group.batch_id,
      subject_id: group.subject_id,
      po_id: group.po_id,
      po_number: group.po_number,
      attainment_percentage: Number(attainmentPercentage.toFixed(2))
    });
  }

  // Structurally sort exactly aligning logic mathematically parsing batches cleanly rendering frontends efficiently
  return results.sort((a, b) => {
    if (a.batch_id !== b.batch_id) return (Number(a.batch_id) || 0) - (Number(b.batch_id) || 0);
    if (a.regulation_id !== b.regulation_id) return (Number(a.regulation_id) || 0) - (Number(b.regulation_id) || 0);
    if (a.subject_id !== b.subject_id) return (Number(a.subject_id) || 0) - (Number(b.subject_id) || 0);
    if (a.po_number && b.po_number) return a.po_number.localeCompare(b.po_number);
    return 0;
  });
}

module.exports = {
  computePoAttainment
};
