# Attendance Module Execution Plan

## 1. Goal
The objective of `attendance.js` is to compute the precise dynamically weighted attendance score for each student within a `SUBJECT_OFFERING`.

Because a single subject might have multiple components (e.g., Theory, Lab, Practical), the raw attendance percentage of each component is independently multiplied by its corresponding Component Weightage (which is strictly defined in the `ATTENDANCE_RULE` table based on Curriculum Regulations).

## 2. Input Data Structure 
The `computeAttendance(data)` function expects a highly flattened result from the PostgreSQL routing layer `attendanceService.js`, where every percentage is perfectly matched to its rule.

### Example Input Array
```json
[
  {
    "student_id": 101,
    "attendance_percentage": 90.0,
    "weightage": 0.5
  },
  {
    "student_id": 101,
    "attendance_percentage": 100.0,
    "weightage": 0.5
  },
  {
    "student_id": 102,
    "attendance_percentage": 85.0,
    "weightage": 1.0
  }
]
```

## 3. Step-by-Step Algorithm Strategy

### Step 1: Input Validation
- Guard against null, undefined, or empty arrays. 
- Return an empty array instantly to prevent crashes.

### Step 2: Grouping (Map Phase)
- Traverse the array of records.
- Validate `attendance_percentage` as a float (treat null as 0).
- Validate `weightage` as a float (default to 0 to prevent accidental score injections).
- Group running totals by `student_id`.

### Step 3: Calculation (Reduce Phase)
- Convert the grouped map back into the final Array format.
- `weighted_score` calculation = running sum of `(attendance_percentage * weightage)`.
- Enforce rounding to 2 decimal places to keep data pristine for dashboard metrics.

## 4. Expected Output Format
```json
[
  {
    "student_id": 101,
    "weighted_score": 95.00
  },
  {
    "student_id": 102,
    "weighted_score": 85.00
  }
]
```
