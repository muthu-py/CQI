const db = require('../db');
const { computePoAttainment } = require('../../analysis/po_attainment/poAttainment');

exports.calculatePoAttainment = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id } = params || {};
  
  let q = `
    SELECT 
        qm.po_id,
        p.po_number,
        qm.weightage,
        q.max_marks,
        sqm.marks_obtained,
        so.batch_id,
        so.regulation_id,
        so.subject_id
    FROM student_question_marks sqm
    JOIN question q ON sqm.question_id = q.question_id
    JOIN question_co_po_map qm ON q.question_id = qm.question_id
    JOIN po p ON qm.po_id = p.po_id
    JOIN exam e ON q.exam_id = e.exam_id
    JOIN subject_offering so ON e.offering_id = so.offering_id
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

  const res = await db.query(q, queryParams);
  return computePoAttainment(res.rows);
};
