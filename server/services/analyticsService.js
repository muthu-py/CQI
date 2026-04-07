const db = require('../db');

const classifyComponentType = `
  CASE
    WHEN ec.type IS NOT NULL AND LOWER(ec.type::text) IN ('internal', 'external')
      THEN LOWER(ec.type::text)
    WHEN LOWER(COALESCE(ec.name, '')) LIKE 'end semester%'
      OR LOWER(COALESCE(ec.name, '')) IN ('end-semester', 'semester end', 'external')
      OR LOWER(COALESCE(ec.name, '')) LIKE 'end practical%'
      OR LOWER(COALESCE(ec.name, '')) LIKE 'final demo%'
      THEN 'external'
    ELSE 'internal'
  END
`;

async function getPercentagesByType(offeringId, componentType) {
  const query = `
    WITH component_exams AS (
      SELECT
        e.exam_id,
        e.max_marks,
        COALESCE(NULLIF(ec.weightage, 0), 1) AS weightage,
        ${classifyComponentType} AS component_type
      FROM exam e
      JOIN evaluation_component ec ON ec.component_id = e.component_id
      WHERE e.offering_id = $1
    ),
    student_scores AS (
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
      WHERE ce.component_type = $2
      GROUP BY scm.student_id
    )
    SELECT
      s.student_id,
      COALESCE(s.name, 'Student #' || s.student_id::text) AS student_name,
      ROUND(LEAST(100, GREATEST(0, ss.pct))::numeric, 2) AS percentage
    FROM student_scores ss
    JOIN student s ON s.student_id = ss.student_id
    ORDER BY s.student_id;
  `;

  const result = await db.query(query, [offeringId, componentType]);
  return result.rows;
}

exports.getInternalPercentages = async (offeringId) => {
  const rows = await getPercentagesByType(offeringId, 'internal');
  return rows.map((row) => ({
    student_id: row.student_id,
    student_name: row.student_name,
    internal_percentage: row.percentage,
  }));
};

exports.getExternalPercentages = async (offeringId) => {
  const rows = await getPercentagesByType(offeringId, 'external');
  return rows.map((row) => ({
    student_id: row.student_id,
    student_name: row.student_name,
    external_percentage: row.percentage,
  }));
};
