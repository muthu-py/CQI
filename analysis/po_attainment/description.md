# Program Outcome (PO) Analytics Module

Program Outcomes measure whether a given academic degree or program is fundamentally successful in teaching general institutional standards mathematically scaling across different test courses and specific syllabus weightages.

## Tracking Mechanism Constraints
Instead of arbitrarily analyzing broad survey results, this engine strictly pulls granular success markings from student examinations (`marks_obtained` against `max_marks`).

If an internal exam explicitly maps Question 3 to `PO_2` utilizing an objective weight structure of `1.5` over `3.0`, the system fundamentally scales the student's fractional scores against that weight scaling.

## Algorithm Computation Process
1. Group all database query constraints mapping `marks_obtained` sequentially up into isolated buckets defined securely around specific `batch_id`, `regulation_id`, and exact `po_id` values preventing historical data overlap.
2. Natively sum structural averages.
3. Multiply those averages intelligently evaluating their mapped weight scaling mathematically defining an overarching global `"PO_Attainment_Score"`.
4. Render cleanly formatting API payload objects instantly consumed linearly in structural frontend charts across entire faculties visually efficiently.
