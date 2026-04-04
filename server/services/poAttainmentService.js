const db = require('../db');
const { computePoAttainment } = require('../../analysis/po_attainment/poAttainment');

function processPoAttainment(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  const map = {};
  
  data.forEach((row) => {
    const key = `REG${row.regulation_id || 'X'}-SUB${row.subject_id || 'Y'}-CO${row.co_number || row.co_id}-PO${row.po_id}`;
    if (!map[key]) {
      map[key] = { 
        regulation_id: row.regulation_id,
        start_year: row.start_year || row.regulation_id,
        subject_id: row.subject_id,
        subject_name: row.subject_name || '',
        co_number: row.co_number || row.co_id, 
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
    start_year: item.start_year,
    subject_id: item.subject_id,
    subject_name: item.subject_name,
    co_number: item.co_number,
    po_id: item.po_id,
    attainment: Number((item.sum / item.count).toFixed(2))
  }));
}

exports.calculatePoAttainment = async (params) => {
  const data = {};
  return computePoAttainment(data);
};

exports.fetchDesiredCoPo = async (queryParams) => {
  const { regulation_id, subject_id } = queryParams;
  
  let q = `
    SELECT map.subject_id, s.subject_name, map.regulation_id, r.start_year, c.co_number, map.po_id, map.weightage 
    FROM subject_co_po_map map
    LEFT JOIN subject s ON map.subject_id = s.subject_id
    LEFT JOIN regulation r ON map.regulation_id = r.regulation_id
    LEFT JOIN co c ON map.co_id = c.co_id
    WHERE 1=1
  `;
  let params = [];
  if (regulation_id) { params.push(regulation_id); q += ` AND map.regulation_id = $${params.length}`; }
  if (subject_id) { params.push(subject_id); q += ` AND map.subject_id = $${params.length}`; }

  const res = await db.query(q, params);
  return processPoAttainment(res.rows); 
};

exports.fetchAchievedQuestionCoPo = async (queryParams) => {
  const { regulation_id, subject_id } = queryParams;

  let q = `
    SELECT so.subject_id, s.subject_name, so.regulation_id, r.start_year, c.co_number, qm.po_id, qm.weightage 
    FROM question_co_po_map qm
    JOIN question q ON qm.question_id = q.question_id
    JOIN exam e ON q.exam_id = e.exam_id
    JOIN subject_offering so ON e.offering_id = so.offering_id
    LEFT JOIN subject s ON so.subject_id = s.subject_id
    LEFT JOIN regulation r ON so.regulation_id = r.regulation_id
    LEFT JOIN co c ON qm.co_id = c.co_id
    WHERE 1=1
  `;
  let params = [];
  if (regulation_id) { params.push(regulation_id); q += ` AND so.regulation_id = $${params.length}`; }
  if (subject_id) { params.push(subject_id); q += ` AND so.subject_id = $${params.length}`; }

  const res = await db.query(q, params);
  return processPoAttainment(res.rows); 
};
