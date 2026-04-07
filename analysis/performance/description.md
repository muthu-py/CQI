# Performance Analytics Module

The Performance Analytics Module serves as the critical mathematical evaluator for Grade Standardizations. It specifically measures if Internal subjective grading aligns with rigorous External university metrics by calculating the statistical "Gap" between them.

## Data Normalization Requirements
A student scoring `45/50` Internally physically has more "points" than a student scoring `40/100` Externally, however comparing `45` to `40` is a broken metric constraint.

Therefore, this mathematical module inherently converts ALL scores into clean **Percentages** `(obtained / max * 100)` prior to bucketing.

## Process Core Output
The core algorithm:
1. Iterates completely uniformly linearly through the `data` array exactly once.
2. Checks the `exam_type` assigned to each mark block.
3. Groups percentages neatly into `Internal` variables vs `External` variables.
4. Completes by generating an overarching class/group average for both properties individually.
5. Identifies inconsistencies by subtracting the `External Score` from the `Internal Score` strictly using `Math.abs()`. An acceptable `performance_gap` usually sits safely under `15%`.

### Example Final Output:
```json
{
  "internal_score": 82.50,
  "external_score": 76.20,
  "performance_gap": 6.30
}
```
