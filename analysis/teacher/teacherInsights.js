const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const round2 = (value) => Number(Number(value || 0).toFixed(2));

const normalizeId = (value, fallback = 'unknown') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const normalizeTeacherName = (teacherName, teacherId) => {
  const name = String(teacherName || '')
    .replace(/\.(?=\S)/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
  if (name) return name;
  return `Teacher ${teacherId}`;
};

const normalizeSectionName = (row) => {
  const raw = String(row.section_name || '').trim();
  if (raw) return raw;
  if (row.section_id !== undefined && row.section_id !== null) return `Section ${row.section_id}`;
  return 'Unknown Section';
};

const normalizeExamType = (value) => {
  const raw = String(value || '').toLowerCase().trim();
  if (!raw) return 'other';
  if (raw.includes('internal') || raw.includes('mid') || raw.includes('cia') || raw.includes('sessional')) return 'internal';
  if (raw.includes('external') || raw.includes('end') || raw.includes('sem')) return 'external';
  return 'other';
};

const percent = (obtained, offered) => (
  offered > 0 ? round2((obtained / offered) * 100) : 0
);

const compareMaybeNumeric = (left, right) => {
  const leftNum = Number(left);
  const rightNum = Number(right);
  const leftNumeric = Number.isFinite(leftNum);
  const rightNumeric = Number.isFinite(rightNum);

  if (leftNumeric && rightNumeric) return leftNum - rightNum;
  if (leftNumeric) return -1;
  if (rightNumeric) return 1;
  return String(left).localeCompare(String(right));
};

const hasCoMapping = (row) => row.has_co_mapping !== undefined && row.has_co_mapping !== null;

const selectedTeacherMatches = (row, options = {}) => {
  const selectedTeacherId = options.teacherId ?? null;
  if (selectedTeacherId === null || selectedTeacherId === undefined || selectedTeacherId === '') return true;
  return normalizeId(row.teacher_id, 'unknown_teacher') === String(selectedTeacherId);
};

const addPerformancePoint = (bucket, row) => {
  const obtained = toNumber(row.marks_obtained);
  const max = toNumber(row.max_marks);
  if (max === null || max <= 0) return false;

  bucket.total_offered += max;
  bucket.total_gained += obtained === null ? 0 : obtained;

  if (hasCoMapping(row)) {
    bucket.co_offered += max;
    bucket.co_gained += obtained === null ? 0 : obtained;
  }

  return true;
};

const buildTeacherStudentScores = (rows = []) => {
  const perTeacherStudent = new Map();

  for (const row of rows) {
    const teacherId = normalizeId(row.teacher_id, 'unknown_teacher');
    const studentId = normalizeId(row.student_id, null);
    if (!studentId) continue;

    const max = toNumber(row.max_marks);
    if (max === null || max <= 0) continue;
    const obtained = toNumber(row.marks_obtained);

    const key = `${teacherId}::${studentId}`;
    if (!perTeacherStudent.has(key)) {
      perTeacherStudent.set(key, {
        teacher_id: row.teacher_id ?? null,
        teacher_name: normalizeTeacherName(row.teacher_name, teacherId),
        student_id: row.student_id,
        total_gained: 0,
        total_offered: 0,
      });
    }

    const bucket = perTeacherStudent.get(key);
    bucket.total_offered += max;
    bucket.total_gained += obtained === null ? 0 : obtained;
  }

  const perTeacher = new Map();

  for (const entry of perTeacherStudent.values()) {
    if (entry.total_offered <= 0) continue;

    const score = (entry.total_gained / entry.total_offered) * 100;
    const teacherKey = normalizeId(entry.teacher_id, 'unknown_teacher');

    if (!perTeacher.has(teacherKey)) {
      perTeacher.set(teacherKey, {
        teacher_id: entry.teacher_id,
        teacher_name: entry.teacher_name,
        scores: [],
      });
    }

    perTeacher.get(teacherKey).scores.push(score);
  }

  return perTeacher;
};

function computeSubjectTeacherPerformance(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const buckets = new Map();

  for (const row of rows) {
    const teacherId = normalizeId(row.teacher_id, 'unknown_teacher');
    const key = teacherId;

    if (!buckets.has(key)) {
      buckets.set(key, {
        teacher_id: row.teacher_id ?? null,
        teacher_name: normalizeTeacherName(row.teacher_name, teacherId),
        total_gained: 0,
        total_offered: 0,
        co_gained: 0,
        co_offered: 0,
        students: new Set(),
        batches: new Set(),
      });
    }

    const bucket = buckets.get(key);
    const wasAdded = addPerformancePoint(bucket, row);
    if (!wasAdded) continue;

    if (row.student_id !== undefined && row.student_id !== null) {
      bucket.students.add(String(row.student_id));
    }
    if (row.batch_id !== undefined && row.batch_id !== null) {
      bucket.batches.add(String(row.batch_id));
    }
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      teacher_id: bucket.teacher_id,
      teacher_name: bucket.teacher_name,
      avg_score: percent(bucket.total_gained, bucket.total_offered),
      co_attainment_score: percent(bucket.co_gained, bucket.co_offered),
      student_count: bucket.students.size,
      batch_count: bucket.batches.size,
    }))
    .sort((a, b) => (
      b.avg_score - a.avg_score || a.teacher_name.localeCompare(b.teacher_name)
    ));
}

function computeTeacherBatchPerformance(rows = [], options = {}) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const buckets = new Map();

  for (const row of rows) {
    if (!selectedTeacherMatches(row, options)) continue;

    const teacherId = normalizeId(row.teacher_id, 'unknown_teacher');
    const batchId = normalizeId(row.batch_id, 'unknown_batch');
    const key = `${teacherId}::${batchId}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        teacher_id: row.teacher_id ?? null,
        teacher_name: normalizeTeacherName(row.teacher_name, teacherId),
        batch_id: row.batch_id ?? null,
        total_gained: 0,
        total_offered: 0,
        co_gained: 0,
        co_offered: 0,
        students: new Set(),
      });
    }

    const bucket = buckets.get(key);
    const wasAdded = addPerformancePoint(bucket, row);
    if (!wasAdded) continue;

    if (row.student_id !== undefined && row.student_id !== null) {
      bucket.students.add(String(row.student_id));
    }
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      teacher_id: bucket.teacher_id,
      teacher_name: bucket.teacher_name,
      batch_id: bucket.batch_id,
      avg_score: percent(bucket.total_gained, bucket.total_offered),
      co_attainment_score: percent(bucket.co_gained, bucket.co_offered),
      student_count: bucket.students.size,
    }))
    .sort((a, b) => (
      compareMaybeNumeric(a.teacher_id, b.teacher_id) || compareMaybeNumeric(a.batch_id, b.batch_id)
    ));
}

function computeTeacherSectionPerformance(rows = [], options = {}) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const buckets = new Map();

  for (const row of rows) {
    if (!selectedTeacherMatches(row, options)) continue;

    const teacherId = normalizeId(row.teacher_id, 'unknown_teacher');
    const batchId = normalizeId(row.batch_id, 'unknown_batch');
    const sectionId = normalizeId(row.section_id, 'unknown_section');
    const key = `${teacherId}::${batchId}::${sectionId}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        teacher_id: row.teacher_id ?? null,
        teacher_name: normalizeTeacherName(row.teacher_name, teacherId),
        batch_id: row.batch_id ?? null,
        section_id: row.section_id ?? null,
        section_name: normalizeSectionName(row),
        total_gained: 0,
        total_offered: 0,
        co_gained: 0,
        co_offered: 0,
        students: new Set(),
      });
    }

    const bucket = buckets.get(key);
    const wasAdded = addPerformancePoint(bucket, row);
    if (!wasAdded) continue;

    if (row.student_id !== undefined && row.student_id !== null) {
      bucket.students.add(String(row.student_id));
    }
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      teacher_id: bucket.teacher_id,
      teacher_name: bucket.teacher_name,
      batch_id: bucket.batch_id,
      section_id: bucket.section_id,
      section_name: bucket.section_name,
      avg_score: percent(bucket.total_gained, bucket.total_offered),
      co_attainment_score: percent(bucket.co_gained, bucket.co_offered),
      student_count: bucket.students.size,
    }))
    .sort((a, b) => (
      compareMaybeNumeric(a.batch_id, b.batch_id) || compareMaybeNumeric(a.section_id, b.section_id)
    ));
}

function computeTeacherExamTypePerformance(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const buckets = new Map();

  for (const row of rows) {
    const teacherId = normalizeId(row.teacher_id, 'unknown_teacher');
    const examType = normalizeExamType(row.exam_type);
    const key = `${teacherId}::${examType}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        teacher_id: row.teacher_id ?? null,
        teacher_name: normalizeTeacherName(row.teacher_name, teacherId),
        exam_type: examType,
        total_gained: 0,
        total_offered: 0,
      });
    }

    const bucket = buckets.get(key);
    const obtained = toNumber(row.marks_obtained);
    const max = toNumber(row.max_marks);
    if (max === null || max <= 0) continue;

    bucket.total_offered += max;
    bucket.total_gained += obtained === null ? 0 : obtained;
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      teacher_id: bucket.teacher_id,
      teacher_name: bucket.teacher_name,
      exam_type: bucket.exam_type,
      avg_score: percent(bucket.total_gained, bucket.total_offered),
    }))
    .sort((a, b) => (
      a.teacher_name.localeCompare(b.teacher_name) || a.exam_type.localeCompare(b.exam_type)
    ));
}

function computeTeacherPassFailComparison(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const perTeacher = buildTeacherStudentScores(rows);

  return Array.from(perTeacher.values())
    .map((bucket) => {
      const count = bucket.scores.length;
      const passCount = bucket.scores.filter((score) => score >= 50).length;
      const failCount = count - passCount;
      const avgScore = count > 0 ? bucket.scores.reduce((sum, value) => sum + value, 0) / count : 0;

      return {
        teacher_id: bucket.teacher_id,
        teacher_name: bucket.teacher_name,
        student_count: count,
        pass_count: passCount,
        fail_count: failCount,
        pass_percentage: count > 0 ? round2((passCount / count) * 100) : 0,
        fail_percentage: count > 0 ? round2((failCount / count) * 100) : 0,
        avg_score: round2(avgScore),
      };
    })
    .sort((a, b) => b.pass_percentage - a.pass_percentage || a.teacher_name.localeCompare(b.teacher_name));
}

function computeTeacherLoadComparison(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const perTeacher = buildTeacherStudentScores(rows);

  return Array.from(perTeacher.values())
    .map((bucket) => {
      const count = bucket.scores.length;
      const avgScore = count > 0 ? bucket.scores.reduce((sum, value) => sum + value, 0) / count : 0;

      return {
        teacher_id: bucket.teacher_id,
        teacher_name: bucket.teacher_name,
        student_count: count,
        avg_score: round2(avgScore),
      };
    })
    .sort((a, b) => b.student_count - a.student_count || b.avg_score - a.avg_score);
}

function computeTeacherConsistencyComparison(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const perTeacher = buildTeacherStudentScores(rows);

  return Array.from(perTeacher.values())
    .map((bucket) => {
      const count = bucket.scores.length;
      const mean = count > 0 ? bucket.scores.reduce((sum, value) => sum + value, 0) / count : 0;
      const variance = count > 0
        ? bucket.scores.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / count
        : 0;
      const stddev = Math.sqrt(Math.max(0, variance));
      const consistencyIndex = Math.max(0, 100 - stddev);

      return {
        teacher_id: bucket.teacher_id,
        teacher_name: bucket.teacher_name,
        student_count: count,
        avg_score: round2(mean),
        score_stddev: round2(stddev),
        consistency_index: round2(consistencyIndex),
      };
    })
    .sort((a, b) => b.consistency_index - a.consistency_index || a.teacher_name.localeCompare(b.teacher_name));
}

module.exports = {
  computeSubjectTeacherPerformance,
  computeTeacherBatchPerformance,
  computeTeacherSectionPerformance,
  computeTeacherExamTypePerformance,
  computeTeacherPassFailComparison,
  computeTeacherLoadComparison,
  computeTeacherConsistencyComparison,
};
