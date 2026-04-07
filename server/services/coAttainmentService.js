const db = require('../db');
const { computeCoAttainment } = require('../../analysis/co_attainment/coAttainment');

exports.calculateCoAttainment = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id, student_id } = params || {};
  
  let q = `
    SELECT 
      sqm.student_id,
      q.question_id,
      sqm.marks_obtained,
      q.max_marks,
      c.co_id,
      c.co_number,
      so.regulation_id,
      so.batch_id
    FROM student_question_marks sqm
    JOIN question q ON sqm.question_id = q.question_id
    JOIN question_co_po_map qm ON q.question_id = qm.question_id
    JOIN co c ON qm.co_id = c.co_id
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
  if (student_id) {
    queryParams.push(student_id);
    q += ` AND sqm.student_id = $${queryParams.length}`;
  }

  // Fetch from the real database and pipe the data to our mathematical module
  const res = await db.query(q, queryParams);
  return computeCoAttainment(res.rows);
};
