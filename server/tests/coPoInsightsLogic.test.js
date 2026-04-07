const test = require('node:test');
const assert = require('node:assert/strict');
const {
  plannedTargetFromWeightage,
  buildMergedPlannedVsAchieved,
  buildRecommendations,
} = require('../services/logic/coPoInsightsLogic');

test('planned target from weightage', () => {
  assert.equal(plannedTargetFromWeightage(1), 33.33);
  assert.equal(plannedTargetFromWeightage(3), 99.99);
});

test('merged rows include status and gap', () => {
  const planned = [{ co_id: 1, co_number: 'CO1', po_id: 2, po_number: 'PO2', weightage: 3 }];
  const achieved = [{ co_id: 1, po_id: 2, attained_percentage: 60 }];
  const merged = buildMergedPlannedVsAchieved(planned, achieved);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].co_number, 'CO1');
  assert.equal(merged[0].po_number, 'PO2');
  assert.equal(merged[0].planned_target_percentage, 99.99);
  assert.equal(merged[0].achieved_percentage, 60);
  assert.equal(merged[0].status, 'critical');
});

test('recommendations sorted by gap descending', () => {
  const recommendations = buildRecommendations([
    { co_number: 'CO1', po_number: 'PO1', gap_percentage: 12 },
    { co_number: 'CO2', po_number: 'PO2', gap_percentage: 30 },
  ]);

  assert.equal(recommendations.length, 2);
  assert.equal(recommendations[0].co_number, 'CO2');
  assert.equal(recommendations[0].priority, 'high');
});
