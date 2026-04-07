# Comparisons Analytics Module

The Comparisons analytics module essentially operates as the "Master View" of the CQI platform, scientifically evaluating overarching academic trends across different groups.

## Input Constraints
The Javascript module `generateComparison(data)` expects a flattened array where each object contains a student's `total_marks` scored in an exam, completely decorated with metadata about their environment:
- `exam_type`: Distinguishes "Internal" vs "External" assessments.
- `attendance_percentage`: The student's recorded attendance, used to mathematically prove if better attendance maps to better scoring.
- `section_id`, `teacher_id`, `batch_id`, `regulation_id`: Context tags for grouping.

## Output Mapping Strategy

The module uses Javascript's high-speed memory maps to do a singular massive Map/Reduce. It creates 6 different isolated dictionaries concurrently:

1. **`internal_vs_external`**: Aggregates average marks based on component types.
2. **`attendance_vs_performance`**: Sorts students into 4 distinct statistical buckets (`>90%`, `80-90%`, `70-80%`, `<70%`) and maps the average marks of students inside that attendance bucket.
3. **`class_wise`**: Averages performance per specific classroom Section.
4. **`faculty_wise`**: Averages performance mapped to Teacher IDs.
5. **`batch_wise`**: Cohort-based historic trending.
6. **`regulation_wise`**: Measures macro shifts in quality based on curriculum changes. 

Output guarantees numerical data rounded cleanly to two decimal points, perfectly ready for dashboard plotting!
