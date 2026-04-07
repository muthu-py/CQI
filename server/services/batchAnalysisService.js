const db = require('../db');
const { computeBatchMarks } = require('../../analysis/batch/batchMarks');
const { computeBatchAttendance } = require('../../analysis/batch/batchAttendance');

/**
 * Fetch student marks grouped by batch → section.
 * If batch_id is provided, only that batch's sections are returned.
 * Requires: regulation_id + subject_id
 */
exports.getBatchMarksAnalysis = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id, section_id } = params || {};

  let q = `
    SELECT
      scm.student_id,
      scm.total_marks,
      e.max_marks,
      so.batch_id,
      so.section_id,
      sec.name AS section_name
    FROM student_component_marks scm
    JOIN exam e ON scm.exam_id = e.exam_id
    JOIN subject_offering so ON e.offering_id = so.offering_id
    LEFT JOIN section sec ON so.section_id = sec.section_id
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
  if (section_id) {
    queryParams.push(section_id);
    q += ` AND so.section_id = $${queryParams.length}`;
  }

  const res = await db.query(q, queryParams);
  return computeBatchMarks(res.rows);
};

/**
 * Fetch student attendance grouped by batch → section.
 * If batch_id is provided, only that batch's sections are returned.
 * Requires: regulation_id + subject_id
 */
exports.getBatchAttendanceAnalysis = async (params) => {
  const { offering_id, subject_id, batch_id, regulation_id, section_id } = params || {};

  let q = `
    SELECT
      sa.student_id,
      sa.attendance_percentage,
      ar.weightage,
      so.batch_id,
      so.section_id,
      sec.name AS section_name
    FROM student_attendance sa
    JOIN subject_offering so ON sa.offering_id = so.offering_id
    JOIN subject s ON so.subject_id = s.subject_id
    JOIN attendance_rule ar
      ON so.regulation_id = ar.regulation_id
      AND s.subject_type = ar.subject_type
      AND sa.component_id = ar.component_id
    LEFT JOIN section sec ON so.section_id = sec.section_id
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
  if (section_id) {
    queryParams.push(section_id);
    q += ` AND so.section_id = $${queryParams.length}`;
  }

  const res = await db.query(q, queryParams);
  return computeBatchAttendance(res.rows);
};
