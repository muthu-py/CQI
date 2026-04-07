const plannedTargetFromWeightage = (weightage) => Math.min(100, Number((Number(weightage || 0) * 33.33).toFixed(2)));

const buildMergedPlannedVsAchieved = (plannedRows = [], achievedRows = []) => {
  const achievedByKey = new Map(
    achievedRows.map((row) => [
      `${row.co_id}::${row.po_id}`,
      Number(row.attained_percentage || 0),
    ])
  );

  return plannedRows.map((row) => {
    const plannedWeightage = Number(row.weightage || 0);
    const plannedTargetPercentage = plannedTargetFromWeightage(plannedWeightage);
    const achievedPercentage = achievedByKey.get(`${row.co_id}::${row.po_id}`) || 0;
    const gapPercentage = Number((plannedTargetPercentage - achievedPercentage).toFixed(2));

    let status = 'on-track';
    if (gapPercentage > 20) status = 'critical';
    else if (gapPercentage > 10) status = 'watch';

    return {
      co_id: row.co_id,
      co_number: row.co_number,
      po_id: row.po_id,
      po_number: row.po_number,
      planned_weightage: plannedWeightage,
      planned_target_percentage: plannedTargetPercentage,
      achieved_percentage: achievedPercentage,
      gap_percentage: gapPercentage,
      status,
    };
  });
};

const buildRecommendations = (mergedRows = []) => mergedRows
  .filter((item) => item.gap_percentage > 10)
  .sort((a, b) => b.gap_percentage - a.gap_percentage)
  .slice(0, 8)
  .map((item) => ({
    co_number: item.co_number,
    po_number: item.po_number,
    gap_percentage: item.gap_percentage,
    priority: item.gap_percentage > 20 ? 'high' : 'medium',
    recommended_action:
      item.gap_percentage > 20
        ? 'Increase targeted internal assessments and remediation for this CO-PO pair.'
        : 'Add focused practice questions and monitor next exam cycle.',
  }));

module.exports = {
  plannedTargetFromWeightage,
  buildMergedPlannedVsAchieved,
  buildRecommendations,
};
