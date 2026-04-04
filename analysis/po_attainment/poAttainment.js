/**
 * Computes PO Attainment.
 * Pure function. Handles grouping an array of { co_id, po_id, weightage } into a structured output.
 * 
 * @param {Array} data - Array of mapping records
 * @returns {Array} Computed average PO Attainment grouped by co_id and po_id
 */
function computePoAttainment(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  const map = {};
  
  data.forEach((row) => {
    // Unique key across subject, regulation, CO, and PO
    const key = `REG${row.regulation_id || 'X'}-SUB${row.subject_id || 'Y'}-CO${row.co_id}-PO${row.po_id}`;
    if (!map[key]) {
      map[key] = { 
        regulation_id: row.regulation_id,
        subject_id: row.subject_id,
        co_id: row.co_id, 
        po_id: row.po_id, 
        sum: 0, 
        count: 0 
      };
    }
    map[key].sum += parseFloat(row.weightage) || 0;
    map[key].count += 1;
  });

  return Object.values(map).map(item => ({
    regulation_id: item.regulation_id,
    subject_id: item.subject_id,
    co_id: item.co_id,
    po_id: item.po_id,
    attainment: Number((item.sum / item.count).toFixed(2))
  }));
}

module.exports = {
  computePoAttainment
};
