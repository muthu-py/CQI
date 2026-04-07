const db = require('../db');
const { computeAttendance } = require('../../analysis/attendance/attendance');

exports.calculateAttendance = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id, student_id } = params || {};
  
  let q = `
    SELECT 
      sa.student_id,
      sa.attendance_percentage,
      ar.weightage
    FROM student_attendance sa
    JOIN subject_offering so ON sa.offering_id = so.offering_id
    JOIN subject s ON so.subject_id = s.subject_id
    JOIN attendance_rule ar 
      ON so.regulation_id = ar.regulation_id 
      AND s.subject_type = ar.subject_type 
      AND sa.component_id = ar.component_id
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
    q += ` AND sa.student_id = $${queryParams.length}`;
  }

  // Fetch contextual raw metrics array tied strictly to this Subject Offering 
  const res = await db.query(q, queryParams);
  
  // Calculate directly utilizing pure JavaScript
  return computeAttendance(res.rows);
};
