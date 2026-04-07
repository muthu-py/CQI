const db = require('../db');
const { normalizeFilters } = require('../utils/filterUtils');
const {
  buildMergedPlannedVsAchieved,
  buildRecommendations,
} = require('./logic/coPoInsightsLogic');

exports.getFilterOptions = async (params) => {
  const { regulation_id: regulationId, subject_id: subjectId } = normalizeFilters(params);

  const regulationsRes = await db.query(
    `
      SELECT DISTINCT so.regulation_id
      FROM subject_offering so
      ORDER BY so.regulation_id
    `,
    []
  );

  const subjectParams = [];
  let subjectWhere = 'WHERE 1=1';
  if (regulationId) {
    subjectParams.push(regulationId);
    subjectWhere += ` AND so.regulation_id = $${subjectParams.length}`;
  }

  const subjectsRes = await db.query(
    `
      SELECT DISTINCT so.subject_id, s.subject_name
      FROM subject_offering so
      JOIN subject s ON s.subject_id = so.subject_id
      ${subjectWhere}
      ORDER BY s.subject_name
    `,
    subjectParams
  );

  const batchParams = [];
  let batchWhere = 'WHERE 1=1';
  if (regulationId) {
    batchParams.push(regulationId);
    batchWhere += ` AND so.regulation_id = $${batchParams.length}`;
  }
  if (subjectId) {
    batchParams.push(subjectId);
    batchWhere += ` AND so.subject_id = $${batchParams.length}`;
  }

  const batchesRes = await db.query(
    `
      SELECT DISTINCT so.batch_id
      FROM subject_offering so
      ${batchWhere}
      ORDER BY so.batch_id
    `,
    batchParams
  );

  return {
    contract_version: 'cqi.v1',
    regulations: regulationsRes.rows.map((r) => ({
      regulation_id: r.regulation_id,
      label: `R${r.regulation_id}`,
    })),
    subjects: subjectsRes.rows,
    batches: batchesRes.rows,
  };
};

exports.getCoPoInsights = async (params) => {
  const {
    regulation_id: regulationId,
    subject_id: subjectId,
    batch_id: batchId,
  } = normalizeFilters(params);

  if (!regulationId || !subjectId) {
    return {
      contract_version: 'cqi.v1',
      scope: {
        regulation_id: regulationId,
        subject_id: subjectId,
        batch_id: batchId,
        mode: batchId ? 'single_batch' : 'three_batch',
      },
      planned: [],
      achieved: [],
      exam_type_breakdown: [],
      batch_trend: [],
      merged: [],
      recommendations: [],
    };
  }

  let subjectName = null;
  try {
    const subjectRes = await db.query(
      `SELECT subject_name FROM subject WHERE subject_id = $1 LIMIT 1`,
      [subjectId]
    );
    subjectName = subjectRes.rows[0]?.subject_name || null;
  } catch (_error) {
    // Fallback gracefully if subject_name column is unavailable in a variant schema.
    subjectName = `Subject ${subjectId}`;
  }

  const plannedRes = await db.query(
    `
      SELECT
        m.co_id,
        c.co_number,
        m.po_id,
        p.po_number,
        m.weightage
      FROM subject_co_po_map m
      JOIN co c ON c.co_id = m.co_id
      JOIN po p ON p.po_id = m.po_id
      WHERE m.regulation_id = $1
        AND m.subject_id = $2
      ORDER BY c.co_number, p.po_number
    `,
    [regulationId, subjectId]
  );

  const achievedParams = [regulationId, subjectId];
  let achievedBatchFilter = '';
  if (batchId) {
    achievedParams.push(batchId);
    achievedBatchFilter = ` AND so.batch_id = $${achievedParams.length}`;
  }

  const achievedRes = await db.query(
    `
      SELECT
        qm.co_id,
        c.co_number,
        qm.po_id,
        p.po_number,
        ROUND(
          (
            SUM((COALESCE(sqm.marks_obtained, 0) / NULLIF(q.max_marks, 0)) * COALESCE(qm.weightage, 1))
            / NULLIF(SUM(COALESCE(qm.weightage, 1)), 0)
          ) * 100,
          2
        ) AS attained_percentage,
        COUNT(*) AS total_records
      FROM student_question_marks sqm
      JOIN question q ON q.question_id = sqm.question_id
      JOIN question_co_po_map qm ON qm.question_id = q.question_id
      JOIN exam e ON e.exam_id = q.exam_id
      JOIN subject_offering so ON so.offering_id = e.offering_id
      JOIN co c ON c.co_id = qm.co_id
      JOIN po p ON p.po_id = qm.po_id
      WHERE so.regulation_id = $1
        AND so.subject_id = $2
        ${achievedBatchFilter}
      GROUP BY qm.co_id, c.co_number, qm.po_id, p.po_number
      ORDER BY c.co_number, p.po_number
    `,
    achievedParams
  );

  let examBreakdownRes;
  try {
    examBreakdownRes = await db.query(
      `
        SELECT
          LOWER(ec.type) AS exam_type,
          ROUND(
            (
              SUM((COALESCE(sqm.marks_obtained, 0) / NULLIF(q.max_marks, 0)) * COALESCE(qm.weightage, 1))
              / NULLIF(SUM(COALESCE(qm.weightage, 1)), 0)
            ) * 100,
            2
          ) AS attained_percentage,
          COUNT(*) AS total_records
        FROM student_question_marks sqm
        JOIN question q ON q.question_id = sqm.question_id
        JOIN question_co_po_map qm ON qm.question_id = q.question_id
        JOIN exam e ON e.exam_id = q.exam_id
        JOIN evaluation_component ec ON ec.component_id = e.component_id
        JOIN subject_offering so ON so.offering_id = e.offering_id
        WHERE so.regulation_id = $1
          AND so.subject_id = $2
          ${achievedBatchFilter}
        GROUP BY LOWER(ec.type)
        ORDER BY LOWER(ec.type)
      `,
      achievedParams
    );
  } catch (_error) {
    // Fallback for schemas where `evaluation_component.type` is not present.
    examBreakdownRes = await db.query(
      `
        SELECT
          CONCAT('component_', e.component_id) AS exam_type,
          ROUND(
            (
              SUM((COALESCE(sqm.marks_obtained, 0) / NULLIF(q.max_marks, 0)) * COALESCE(qm.weightage, 1))
              / NULLIF(SUM(COALESCE(qm.weightage, 1)), 0)
            ) * 100,
            2
          ) AS attained_percentage,
          COUNT(*) AS total_records
        FROM student_question_marks sqm
        JOIN question q ON q.question_id = sqm.question_id
        JOIN question_co_po_map qm ON qm.question_id = q.question_id
        JOIN exam e ON e.exam_id = q.exam_id
        JOIN subject_offering so ON so.offering_id = e.offering_id
        WHERE so.regulation_id = $1
          AND so.subject_id = $2
          ${achievedBatchFilter}
        GROUP BY e.component_id
        ORDER BY e.component_id
      `,
      achievedParams
    );
  }

  const trendRes = await db.query(
    `
      SELECT
        so.batch_id,
        ROUND(
          (
            SUM((COALESCE(sqm.marks_obtained, 0) / NULLIF(q.max_marks, 0)) * COALESCE(qm.weightage, 1))
            / NULLIF(SUM(COALESCE(qm.weightage, 1)), 0)
          ) * 100,
          2
        ) AS attained_percentage,
        COUNT(*) AS total_records
      FROM student_question_marks sqm
      JOIN question q ON q.question_id = sqm.question_id
      JOIN question_co_po_map qm ON qm.question_id = q.question_id
      JOIN exam e ON e.exam_id = q.exam_id
      JOIN subject_offering so ON so.offering_id = e.offering_id
      WHERE so.regulation_id = $1
        AND so.subject_id = $2
      GROUP BY so.batch_id
      ORDER BY so.batch_id
    `,
    [regulationId, subjectId]
  );

  const merged = buildMergedPlannedVsAchieved(plannedRes.rows, achievedRes.rows);
  const recommendations = buildRecommendations(merged);

  return {
    contract_version: 'cqi.v1',
    scope: {
      regulation_id: regulationId,
      subject_id: subjectId,
      subject_name: subjectName,
      batch_id: batchId || null,
      mode: batchId ? 'single_batch' : 'three_batch',
    },
    planned: plannedRes.rows,
    achieved: achievedRes.rows,
    exam_type_breakdown: examBreakdownRes.rows,
    batch_trend: trendRes.rows,
    merged,
    recommendations,
  };
};
