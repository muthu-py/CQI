const db = require('../db');
const { computeBatchMarks } = require('../../analysis/batch/batchMarks');
const { computeBatchAttendance } = require('../../analysis/batch/batchAttendance');

/**
 * Fetch student marks grouped by batch → section.
 *
 * Key fix: We join through the student's own section_id (student.section_id → section),
 * NOT the subject_offering's section_id. This is because exams can be associated with
 * one offering (e.g., Section A's offering), but students from all sections submit marks
 * against that exam. The student's actual section must be determined from the student table.
 *
 * Requires: regulation_id + subject_id
 * Optional: batch_id (narrows to one batch; omit to get all batches in the regulation)
 */
exports.getBatchMarksAnalysis = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id } = params || {};

  /*
   * Join path:
   *   student_component_marks (scm)
   *   → exam (e)                         to get max_marks + offering
   *   → subject_offering (so)            to filter by subject/regulation/batch
   *   → student (st)                     to get the student's ACTUAL section
   *   → section (sec)                    to get the section name (A/B/C)
   *
   * We derive batch_id from sec.batch_id (which matches so.batch_id) so the grouping
   * in computeBatchMarks works correctly per batch → section.
   */
  let q = `
    SELECT
      scm.student_id,
      scm.total_marks,
      e.max_marks,
      sec.batch_id,
      st.section_id,
      sec.name AS section_name
    FROM student_component_marks scm
    JOIN exam e        ON scm.exam_id  = e.exam_id
    JOIN subject_offering so ON e.offering_id = so.offering_id
    JOIN student st    ON scm.student_id = st.student_id
    JOIN section sec   ON st.section_id  = sec.section_id
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
  if (regulation_id) {
    queryParams.push(regulation_id);
    q += ` AND so.regulation_id = $${queryParams.length}`;
  }
  // Filter by batch through the student's section (sec.batch_id), not so.batch_id,
  // to remain consistent with the section grouping source.
  if (batch_id) {
    queryParams.push(batch_id);
    q += ` AND sec.batch_id = $${queryParams.length}`;
  }

  const res = await db.query(q, queryParams);
  return computeBatchMarks(res.rows);
};

/**
 * Fetch student attendance grouped by batch → section.
 *
 * Key fix: Same as marks — join via student.section_id to get the student's actual section,
 * not the offering's section.
 *
 * Requires: regulation_id + subject_id
 * Optional: batch_id (narrows to one batch; omit to get all batches in the regulation)
 */
exports.getBatchAttendanceAnalysis = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id } = params || {};

  /*
   * Join path:
   *   student_attendance (sa)
   *   → subject_offering (so)            to filter by subject/regulation and access subject_type
   *   → subject (subj)                   to get subject_type for attendance_rule join
   *   → attendance_rule (ar)             to get weightage for the component
   *   → student (st)                     to get the student's ACTUAL section
   *   → section (sec)                    to get section name + batch_id
   */
  let q = `
    SELECT
      sa.student_id,
      sa.attendance_percentage,
      COALESCE(ar.weightage, 1) AS weightage,
      sec.batch_id,
      st.section_id,
      sec.name AS section_name
    FROM student_attendance sa
    JOIN subject_offering so ON sa.offering_id = so.offering_id
    JOIN subject subj  ON so.subject_id = subj.subject_id
    LEFT JOIN attendance_rule ar
      ON so.regulation_id  = ar.regulation_id
     AND subj.subject_type = ar.subject_type
     AND sa.component_id   = ar.component_id
    JOIN student st  ON sa.student_id   = st.student_id
    JOIN section sec ON st.section_id   = sec.section_id
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
  if (regulation_id) {
    queryParams.push(regulation_id);
    q += ` AND so.regulation_id = $${queryParams.length}`;
  }
  if (batch_id) {
    queryParams.push(batch_id);
    q += ` AND sec.batch_id = $${queryParams.length}`;
  }

  const res = await db.query(q, queryParams);
  return computeBatchAttendance(res.rows);
};
