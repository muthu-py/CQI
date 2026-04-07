const db = require('../db');

const buildSummary = (students = []) => {
  const withInternal = students.filter((row) => row.internal_percentage !== null);
  const withExternal = students.filter((row) => row.external_percentage !== null);
  const withGap = students.filter((row) => row.gap !== null);

  const avg = (rows, key) => {
    if (!rows.length) return null;
    return rows.reduce((sum, row) => sum + Number(row[key]), 0) / rows.length;
  };

  const avgInternal = avg(withInternal, 'internal_percentage');
  const avgExternal = avg(withExternal, 'external_percentage');
  const avgGap = avg(withGap, 'gap');

  return {
    total_students: students.length,
    avg_internal: avgInternal !== null ? Math.round(Math.max(0, Math.min(100, avgInternal)) * 100) / 100 : null,
    avg_external: avgExternal !== null ? Math.round(Math.max(0, Math.min(100, avgExternal)) * 100) / 100 : null,
    avg_gap: avgGap !== null ? Math.round(avgGap * 100) / 100 : null,
  };
};

const aggregatedComponentQuery = `
  WITH
  selected_offering AS (
    SELECT offering_id
    FROM subject_offering
    WHERE subject_id = $1
      AND regulation_id = $2
      AND batch_id = $3
  ),
  component_exams AS (
    SELECT
      e.exam_id,
      e.max_marks,
      CASE
        WHEN ec.type IS NOT NULL AND LOWER(ec.type::text) IN ('internal', 'external')
          THEN LOWER(ec.type::text)
        WHEN LOWER(COALESCE(ec.name, '')) LIKE 'end semester%'
          OR LOWER(COALESCE(ec.name, '')) IN ('end-semester', 'semester end', 'external')
          OR LOWER(COALESCE(ec.name, '')) LIKE 'end practical%'
          OR LOWER(COALESCE(ec.name, '')) LIKE 'final demo%'
          THEN 'external'
        ELSE 'internal'
      END AS component_type,
      COALESCE(NULLIF(ec.weightage, 0), 1) AS weightage
    FROM exam e
    JOIN evaluation_component ec ON ec.component_id = e.component_id
    WHERE e.offering_id IN (SELECT offering_id FROM selected_offering)
  ),
  student_internal AS (
    SELECT
      scm.student_id,
      CASE
        WHEN SUM(ce.weightage) > 0 THEN
          SUM((scm.total_marks / NULLIF(ce.max_marks, 0)) * ce.weightage)
          / SUM(ce.weightage) * 100
        ELSE NULL
      END AS pct
    FROM student_component_marks scm
    JOIN component_exams ce ON ce.exam_id = scm.exam_id
    WHERE ce.component_type = 'internal'
    GROUP BY scm.student_id
  ),
  student_external AS (
    SELECT
      scm.student_id,
      CASE
        WHEN SUM(ce.weightage) > 0 THEN
          SUM((scm.total_marks / NULLIF(ce.max_marks, 0)) * ce.weightage)
          / SUM(ce.weightage) * 100
        ELSE NULL
      END AS pct
    FROM student_component_marks scm
    JOIN component_exams ce ON ce.exam_id = scm.exam_id
    WHERE ce.component_type = 'external'
    GROUP BY scm.student_id
  )
  SELECT
    st.student_id,
    COALESCE(st.name, 'Student #' || st.student_id::text) AS student_name,
    ROUND(LEAST(100, GREATEST(0, si.pct))::numeric, 2) AS internal_percentage,
    ROUND(LEAST(100, GREATEST(0, se.pct))::numeric, 2) AS external_percentage,
    CASE
      WHEN si.pct IS NOT NULL AND se.pct IS NOT NULL
        THEN ROUND((si.pct - se.pct)::numeric, 2)
      ELSE NULL
    END AS gap
  FROM student st
  LEFT JOIN student_internal si ON st.student_id = si.student_id
  LEFT JOIN student_external se ON st.student_id = se.student_id
  WHERE st.batch_id = $3
    AND st.regulation_id = $2
    AND (si.student_id IS NOT NULL OR se.student_id IS NOT NULL)
  ORDER BY st.student_id
`;

async function queryInternalExternal(params, query, label) {
  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error(`InternalExternalService ${label} query failed:`, error.message);
    return null;
  }
}

exports.getInternalExternalComparison = async (params) => {
  const { subject_id, regulation_id, batch_id } = params || {};

  if (!subject_id || !regulation_id || !batch_id) {
    return { students: [], summary: null };
  }

  const queryParams = [subject_id, regulation_id, batch_id];

  const primaryRows = await queryInternalExternal(
    queryParams,
    aggregatedComponentQuery,
    'aggregated'
  );

  if (Array.isArray(primaryRows) && primaryRows.length > 0) {
    return {
      students: primaryRows,
      summary: buildSummary(primaryRows),
    };
  }

  const students = [];

  if (!students.length) {
    console.warn(
      'InternalExternalService returned no rows',
      { subject_id, regulation_id, batch_id }
    );
  }

  return {
    students,
    summary: students.length ? buildSummary(students) : null,
  };
};
