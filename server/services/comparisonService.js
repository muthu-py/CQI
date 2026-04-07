const db = require('../db');
const { generateComparison } = require('../../analysis/comparisons/comparison');

exports.calculateComparison = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id, teacher_id, section_id } = params || {};
  
  // Key fix: join via student.section_id to get the student's actual section,
  // not the offering's section_id (which is always one section per exam).
  let q = `
    SELECT 
        scm.student_id,
        scm.total_marks,
        e.max_marks,
        ec.type AS exam_type,
        sa.attendance_percentage,
        st.section_id,
        sec.name AS section_name,
        so.teacher_id,
        sec.batch_id,
        so.regulation_id
    FROM student_component_marks scm
    JOIN exam e ON scm.exam_id = e.exam_id
    JOIN evaluation_component ec ON e.component_id = ec.component_id
    JOIN subject_offering so ON e.offering_id = so.offering_id
    JOIN student st ON scm.student_id = st.student_id
    JOIN section sec ON st.section_id = sec.section_id
    LEFT JOIN student_attendance sa 
        ON scm.student_id = sa.student_id 
        AND so.offering_id = sa.offering_id 
        AND ec.component_id = sa.component_id
    WHERE 1=1
  `;

  const queryParams = [];
  
  // Dynamic filtering allowed from frontend REST requests
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
    q += ` AND sec.batch_id = $${queryParams.length}`;
  }
  if (regulation_id) {
    queryParams.push(regulation_id);
    q += ` AND so.regulation_id = $${queryParams.length}`;
  }
  if (teacher_id) {
    queryParams.push(teacher_id);
    q += ` AND so.teacher_id = $${queryParams.length}`;
  }
  if (section_id) {
    queryParams.push(section_id);
    q += ` AND st.section_id = $${queryParams.length}`;
  }

  // Fetch structural array and ship to map/reducer
  const res = await db.query(q, queryParams);
  return generateComparison(res.rows, { batchSelected: Boolean(batch_id) });
};
