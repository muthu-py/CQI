const db = require('../db');
const { computeTeacherPerformance } = require('../../analysis/teacher/teacher');

exports.calculateTeacherPerformance = async (params) => {
  const { teacher_id, subject_id, batch_id, regulation_id, offering_id } = params || {};
  
  let q = `
    SELECT 
        so.teacher_id,
        so.subject_id,
        sqm.student_id,
        sqm.marks_obtained,
        q.max_marks,
        c.co_id
    FROM subject_offering so
    JOIN exam e ON so.offering_id = e.offering_id
    JOIN question q ON e.exam_id = q.exam_id
    JOIN student_question_marks sqm ON q.question_id = sqm.question_id
    LEFT JOIN question_co_po_map qm ON q.question_id = qm.question_id
    LEFT JOIN co c ON qm.co_id = c.co_id
    WHERE 1=1
  `;

  const queryParams = [];
  
  if (teacher_id) {
    queryParams.push(teacher_id);
    q += ` AND so.teacher_id = $${queryParams.length}`;
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
  if (offering_id) {
    queryParams.push(offering_id);
    q += ` AND so.offering_id = $${queryParams.length}`;
  }

  // Pull raw array mapping evaluations uniformly securely to teachers and feed it into math loops
  const res = await db.query(q, queryParams);
  return computeTeacherPerformance(res.rows);
};
