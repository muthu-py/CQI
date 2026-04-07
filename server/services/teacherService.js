const db = require('../db');
const { computeTeacherPerformance } = require('../../analysis/teacher/teacher');
const { normalizeFilters } = require('../utils/filterUtils');
const {
  computeSubjectTeacherPerformance,
  computeTeacherBatchPerformance,
  computeTeacherSectionPerformance,
  computeTeacherExamTypePerformance,
  computeTeacherPassFailComparison,
  computeTeacherLoadComparison,
  computeTeacherConsistencyComparison,
} = require('../../analysis/teacher/teacherInsights');

const buildTeacherRowsQuery = (filters = {}, options = {}) => {
  const {
    teacher_id: teacherId,
    subject_id: subjectId,
    batch_id: batchId,
    regulation_id: regulationId,
    offering_id: offeringId,
    section_id: sectionId,
  } = filters;
  const { applyBatchFilter = true } = options;

  let text = `
    SELECT
      so.teacher_id,
      COALESCE(NULLIF(BTRIM(t.name), ''), CONCAT('Teacher ', so.teacher_id::text)) AS teacher_name,
      so.batch_id,
      st.section_id,
      sec.name AS section_name,
      sqm.student_id,
      sqm.marks_obtained,
      q.max_marks,
      qco.has_co_mapping,
      LOWER(COALESCE(ec.type::text, ec.name, 'other')) AS exam_type
    FROM subject_offering so
    LEFT JOIN teacher t ON t.teacher_id = so.teacher_id
    JOIN exam e ON so.offering_id = e.offering_id
    LEFT JOIN evaluation_component ec ON ec.component_id = e.component_id
    JOIN question q ON e.exam_id = q.exam_id
    JOIN student_question_marks sqm ON q.question_id = sqm.question_id
    JOIN student st ON st.student_id = sqm.student_id
    LEFT JOIN section sec ON sec.section_id = st.section_id
    LEFT JOIN LATERAL (
      SELECT 1 AS has_co_mapping
      FROM question_co_po_map qm
      WHERE qm.question_id = q.question_id
      LIMIT 1
    ) qco ON true
    WHERE 1=1
  `;

  const values = [];

  if (teacherId) {
    values.push(teacherId);
    text += ` AND so.teacher_id = $${values.length}`;
  }
  if (subjectId) {
    values.push(subjectId);
    text += ` AND so.subject_id = $${values.length}`;
  }
  if (applyBatchFilter && batchId) {
    values.push(batchId);
    text += ` AND so.batch_id = $${values.length}`;
  }
  if (regulationId) {
    values.push(regulationId);
    text += ` AND so.regulation_id = $${values.length}`;
  }
  if (offeringId) {
    values.push(offeringId);
    text += ` AND so.offering_id = $${values.length}`;
  }
  if (sectionId) {
    values.push(sectionId);
    text += ` AND st.section_id = $${values.length}`;
  }

  return { text, values };
};

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

exports.getTeacherPerformanceInsights = async (params) => {
  const normalized = normalizeFilters(params || {});
  const {
    teacher_id: teacherId,
    subject_id: subjectId,
    batch_id: batchId,
    regulation_id: regulationId,
    offering_id: offeringId,
    section_id: sectionId,
  } = normalized;

  if (!subjectId && !offeringId) {
    return {
      contract_version: 'cqi.v1',
      scope: {
        regulation_id: regulationId || null,
        subject_id: subjectId || null,
        batch_id: batchId || null,
        teacher_id: teacherId || null,
        section_id: sectionId || null,
      },
      subject_teacher_performance: [],
      teacher_batch_performance: [],
      teacher_section_performance: [],
      teacher_exam_type_performance: [],
      teacher_pass_fail_comparison: [],
      teacher_load_comparison: [],
      teacher_consistency_comparison: [],
      default_teacher_id: null,
    };
  }

  const scopedQuery = buildTeacherRowsQuery(normalized, { applyBatchFilter: true });
  const allBatchQuery = buildTeacherRowsQuery(normalized, { applyBatchFilter: false });

  const [scopedRes, allBatchRes] = await Promise.all([
    db.query(scopedQuery.text, scopedQuery.values),
    db.query(allBatchQuery.text, allBatchQuery.values),
  ]);

  const subjectTeacherPerformance = computeSubjectTeacherPerformance(scopedRes.rows);
  const teacherBatchPerformance = computeTeacherBatchPerformance(allBatchRes.rows);
  const teacherSectionPerformance = computeTeacherSectionPerformance(scopedRes.rows);
  const teacherExamTypePerformance = computeTeacherExamTypePerformance(scopedRes.rows);
  const teacherPassFailComparison = computeTeacherPassFailComparison(scopedRes.rows);
  const teacherLoadComparison = computeTeacherLoadComparison(scopedRes.rows);
  const teacherConsistencyComparison = computeTeacherConsistencyComparison(scopedRes.rows);

  const defaultTeacherId = teacherId
    || subjectTeacherPerformance[0]?.teacher_id
    || teacherPassFailComparison[0]?.teacher_id
    || teacherBatchPerformance[0]?.teacher_id
    || null;

  return {
    contract_version: 'cqi.v1',
    scope: {
      regulation_id: regulationId || null,
      subject_id: subjectId || null,
      batch_id: batchId || null,
      teacher_id: teacherId || null,
      section_id: sectionId || null,
    },
    subject_teacher_performance: subjectTeacherPerformance,
    teacher_batch_performance: teacherBatchPerformance,
    teacher_section_performance: teacherSectionPerformance,
    teacher_exam_type_performance: teacherExamTypePerformance,
    teacher_pass_fail_comparison: teacherPassFailComparison,
    teacher_load_comparison: teacherLoadComparison,
    teacher_consistency_comparison: teacherConsistencyComparison,
    default_teacher_id: defaultTeacherId,
  };
};
