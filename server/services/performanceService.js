const db = require('../db');
const { computePerformance } = require('../../analysis/performance/performance');

exports.calculatePerformance = async (params) => {
  const { offering_id, subject_id, student_id, batch_id, regulation_id } = params || {};
  
  let q = `
    SELECT 
        scm.student_id,
        scm.total_marks,
        e.max_marks,
        ec.type AS exam_type
    FROM student_component_marks scm
    JOIN exam e ON scm.exam_id = e.exam_id
    JOIN evaluation_component ec ON e.component_id = ec.component_id
    JOIN subject_offering so ON e.offering_id = so.offering_id
    WHERE 1=1
  `;

  const queryParams = [];
  
  // Apply contextual REST parameter filters structurally 
  if (offering_id) {
    queryParams.push(offering_id);
    q += ` AND so.offering_id = $${queryParams.length}`;
  }
  if (subject_id) {
    queryParams.push(subject_id);
    q += ` AND so.subject_id = $${queryParams.length}`;
  }
  if (student_id) {
    queryParams.push(student_id);
    q += ` AND scm.student_id = $${queryParams.length}`;
  }
  if (batch_id) {
    queryParams.push(batch_id);
    q += ` AND so.batch_id = $${queryParams.length}`;
  }
  if (regulation_id) {
    queryParams.push(regulation_id);
    q += ` AND so.regulation_id = $${queryParams.length}`;
  }

  // Push raw output through mathematical pure logic
  const res = await db.query(q, queryParams);
  return computePerformance(res.rows);
};
