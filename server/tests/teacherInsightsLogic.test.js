const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeSubjectTeacherPerformance,
  computeTeacherBatchPerformance,
  computeTeacherSectionPerformance,
  computeTeacherExamTypePerformance,
  computeTeacherPassFailComparison,
  computeTeacherLoadComparison,
  computeTeacherConsistencyComparison,
} = require('../../analysis/teacher/teacherInsights');

const rows = [
  { teacher_id: 1, teacher_name: 'Teacher One', batch_id: 2022, section_id: 11, section_name: 'A', student_id: 101, marks_obtained: 80, max_marks: 100, has_co_mapping: 1, exam_type: 'internal' },
  { teacher_id: 1, teacher_name: 'Teacher One', batch_id: 2022, section_id: 12, section_name: 'B', student_id: 102, marks_obtained: 60, max_marks: 100, has_co_mapping: null, exam_type: 'external' },
  { teacher_id: 1, teacher_name: 'Teacher One', batch_id: 2023, section_id: 21, section_name: 'A', student_id: 103, marks_obtained: 70, max_marks: 100, has_co_mapping: 1, exam_type: 'internal' },
  { teacher_id: 2, teacher_name: 'Teacher Two', batch_id: 2022, section_id: 11, section_name: 'A', student_id: 104, marks_obtained: 50, max_marks: 100, has_co_mapping: 1, exam_type: 'external' },
  { teacher_id: 2, teacher_name: 'Teacher Two', batch_id: 2022, section_id: 12, section_name: 'B', student_id: 105, marks_obtained: 75, max_marks: 100, has_co_mapping: null, exam_type: 'internal' },
];

test('computeSubjectTeacherPerformance aggregates by teacher', () => {
  const result = computeSubjectTeacherPerformance(rows);

  assert.equal(result.length, 2);

  const teacherOne = result.find((item) => item.teacher_id === 1);
  assert.ok(teacherOne);
  assert.equal(teacherOne.avg_score, 70);
  assert.equal(teacherOne.co_attainment_score, 75);
  assert.equal(teacherOne.student_count, 3);
  assert.equal(teacherOne.batch_count, 2);
});

test('computeTeacherBatchPerformance aggregates by teacher and batch', () => {
  const result = computeTeacherBatchPerformance(rows);
  assert.equal(result.length, 3);

  const teacherOneBatch2022 = result.find((item) => item.teacher_id === 1 && item.batch_id === 2022);
  assert.ok(teacherOneBatch2022);
  assert.equal(teacherOneBatch2022.avg_score, 70);
  assert.equal(teacherOneBatch2022.co_attainment_score, 80);
  assert.equal(teacherOneBatch2022.student_count, 2);
});

test('computeTeacherBatchPerformance filters by selected teacher', () => {
  const result = computeTeacherBatchPerformance(rows, { teacherId: 1 });
  assert.equal(result.length, 2);
  assert.ok(result.every((item) => item.teacher_id === 1));
});

test('computeTeacherSectionPerformance aggregates by section for selected teacher', () => {
  const result = computeTeacherSectionPerformance(rows, { teacherId: 1 });
  assert.equal(result.length, 3);
  assert.equal(result[0].teacher_id, 1);
});

test('computeTeacherExamTypePerformance returns exam type splits', () => {
  const result = computeTeacherExamTypePerformance(rows);
  const internalRow = result.find((item) => item.teacher_id === 1 && item.exam_type === 'internal');
  assert.ok(internalRow);
  assert.equal(internalRow.avg_score, 75);
});

test('computeTeacherPassFailComparison calculates pass/fail percentages', () => {
  const result = computeTeacherPassFailComparison(rows);
  const teacherOne = result.find((item) => item.teacher_id === 1);
  assert.ok(teacherOne);
  assert.equal(teacherOne.pass_count, 3);
  assert.equal(teacherOne.fail_count, 0);
});

test('computeTeacherLoadComparison returns student_count and avg_score', () => {
  const result = computeTeacherLoadComparison(rows);
  const teacherTwo = result.find((item) => item.teacher_id === 2);
  assert.ok(teacherTwo);
  assert.equal(teacherTwo.student_count, 2);
});

test('computeTeacherConsistencyComparison returns stddev and consistency index', () => {
  const result = computeTeacherConsistencyComparison(rows);
  const teacherOne = result.find((item) => item.teacher_id === 1);
  assert.ok(teacherOne);
  assert.ok(teacherOne.score_stddev >= 0);
  assert.ok(teacherOne.consistency_index <= 100);
});
