const coerceNumeric = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^R\d+$/i.test(raw)) return Number(raw.replace(/\D/g, ''));
  if (/^\d+$/.test(raw)) return Number(raw);
  return null;
};

const normalizeFilters = (params = {}) => {
  const normalized = {
    offering_id: coerceNumeric(params.offering_id ?? params.offering),
    subject_id: coerceNumeric(params.subject_id ?? params.subject),
    batch_id: coerceNumeric(params.batch_id ?? params.batch),
    regulation_id: coerceNumeric(params.regulation_id ?? params.regulation),
    teacher_id: coerceNumeric(params.teacher_id ?? params.teacher),
    student_id: coerceNumeric(params.student_id ?? params.student),
    section_id: coerceNumeric(params.section_id ?? params.section),
  };

  return normalized;
};

const isProvided = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const hasInvalidNumericFilters = (params = {}) => {
  const checks = [
    ['offering_id', params.offering_id ?? params.offering],
    ['subject_id', params.subject_id ?? params.subject],
    ['batch_id', params.batch_id ?? params.batch],
    ['regulation_id', params.regulation_id ?? params.regulation],
    ['teacher_id', params.teacher_id ?? params.teacher],
    ['student_id', params.student_id ?? params.student],
    ['section_id', params.section_id ?? params.section],
  ];

  return checks
    .filter(([, value]) => isProvided(value))
    .map(([key, value]) => ({ key, value }))
    .filter(({ value }) => coerceNumeric(value) === null);
};

module.exports = {
  coerceNumeric,
  normalizeFilters,
  hasInvalidNumericFilters,
};
