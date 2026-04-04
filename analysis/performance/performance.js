/**
 * Computes performance metrics (internal, external, gap).
 * Pure function: strictly takes data and returns computed results.
 * 
 * @param {Object} data - Contains STUDENT_COMPONENT_MARKS and EXAM data
 * @returns {Object} Computed performance metrics
 */
function computePerformance(data) {
  // TODO: Implement computation logic in purely JS
  
  return {
    internal_score: 0,
    external_score: 0,
    performance_gap: 0
  };
}

module.exports = {
  computePerformance
};
