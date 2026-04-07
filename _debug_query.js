const db = require('./server/db');

(async () => {
  // Test with Batch 1, Subject 2, Regulation 1 (as shown in screenshot)
  const subject_id = 2, regulation_id = 1, batch_id = 1;

  // Step 1: Check offerings
  const offerings = await db.query(
    'SELECT * FROM subject_offering WHERE subject_id=$1 AND regulation_id=$2 AND batch_id=$3',
    [subject_id, regulation_id, batch_id]
  );
  console.log('=== OFFERINGS ===');
  console.table(offerings.rows);

  if (!offerings.rows.length) {
    console.log('NO OFFERING FOUND — query will return nothing');
    process.exit(0);
  }

  const oid = offerings.rows[0].offering_id;

  // Step 2: Check exams for this offering
  const exams = await db.query(
    `SELECT e.exam_id, e.component_id, e.max_marks, ec.name, ec.type, ec.weightage
     FROM exam e JOIN evaluation_component ec ON ec.component_id = e.component_id
     WHERE e.offering_id = $1`, [oid]
  );
  console.log('=== EXAMS for offering', oid, '===');
  console.table(exams.rows);

  // Step 3: Check student_component_marks for these exams
  const examIds = exams.rows.map(r => r.exam_id);
  if (examIds.length) {
    const scm = await db.query(
      `SELECT scm.student_id, scm.exam_id, scm.total_marks, e.max_marks, ec.name, ec.type
       FROM student_component_marks scm
       JOIN exam e ON e.exam_id = scm.exam_id
       JOIN evaluation_component ec ON ec.component_id = e.component_id
       WHERE scm.exam_id = ANY($1)
       ORDER BY scm.student_id, ec.type
       LIMIT 20`, [examIds]
    );
    console.log('=== STUDENT_COMPONENT_MARKS ===');
    console.table(scm.rows);
  }

  // Step 4: Run the actual service
  const svc = require('./server/services/internalExternalService');
  const result = await svc.getInternalExternalComparison({ subject_id, regulation_id, batch_id });
  console.log('=== SERVICE RESULT (summary) ===');
  console.log(result.summary);
  console.log('=== SERVICE RESULT (first 5 students) ===');
  console.table(result.students.slice(0, 5));

  process.exit(0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
