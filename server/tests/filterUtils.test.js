const test = require('node:test');
const assert = require('node:assert/strict');
const { coerceNumeric, normalizeFilters, hasInvalidNumericFilters } = require('../utils/filterUtils');

test('coerceNumeric supports numbers and regulation strings', () => {
  assert.equal(coerceNumeric('20'), 20);
  assert.equal(coerceNumeric('R20'), 20);
  assert.equal(coerceNumeric('r19'), 19);
  assert.equal(coerceNumeric(''), null);
  assert.equal(coerceNumeric('abc'), null);
});

test('normalizeFilters reads aliases', () => {
  const filters = normalizeFilters({ regulation: 'R20', subject: '101', batch: '2023' });
  assert.equal(filters.regulation_id, 20);
  assert.equal(filters.subject_id, 101);
  assert.equal(filters.batch_id, 2023);
});

test('hasInvalidNumericFilters reports invalid values', () => {
  const invalid = hasInvalidNumericFilters({ regulation: 'RXX', subject_id: 'a12' });
  assert.equal(invalid.length, 2);
});
