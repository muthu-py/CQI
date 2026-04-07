const db = require('../db');
const { normalizeFilters } = require('../utils/filterUtils');

exports.getSubjectCoPoMappings = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id } = normalizeFilters(params);

  let q = `
    SELECT DISTINCT
      so.batch_id,
      so.subject_id,
      s.subject_name,
      so.regulation_id,
      m.co_id,
      c.co_number,
      m.po_id,
      p.po_number,
      m.weightage
    FROM subject_co_po_map m
    JOIN subject s ON m.subject_id = s.subject_id
    JOIN co c ON m.co_id = c.co_id
    JOIN po p ON m.po_id = p.po_id
    JOIN subject_offering so
      ON so.subject_id = m.subject_id
      AND so.regulation_id = m.regulation_id
    WHERE 1=1
  `;

  const queryParams = [];

  if (offering_id) {
    queryParams.push(offering_id);
    q += ` AND so.offering_id = $${queryParams.length}`;
  }

  if (subject_id) {
    queryParams.push(subject_id);
    q += ` AND so.subject_id = $${queryParams.length}`;
  }

  if (batch_id) {
    queryParams.push(batch_id);
    q += ` AND so.batch_id = $${queryParams.length}`;
  }

  if (regulation_id) {
    queryParams.push(regulation_id);
    q += ` AND so.regulation_id = $${queryParams.length}`;
  }

  q += ` ORDER BY so.batch_id, so.subject_id, c.co_number, p.po_number`;

  const res = await db.query(q, queryParams);
  return res.rows;
};
