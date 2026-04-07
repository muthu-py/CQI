# CO Attainment Execution Plan

## 1. Goal
The objective of `coAttainment.js` is to compute the precise class-average attainment percentage for every single Course Outcome (CO) tracked within a specific `SUBJECT_OFFERING`. 

This calculation relies purely on granular student responses to test questions, cross-referenced with how those questions map back to COs.

## 2. Input Data Structure 
The `computeCoAttainment(data)` pure function expects an array of flattened objects resulting from a SQL join. It should look like this:

```json
[
  {
    "student_id": 101,
    "question_id": 1,
    "marks_obtained": 8,
    "max_marks": 10,
    "co_id": 5,
    "co_number": "CO1"
  },
  {
    "student_id": 101,
    "question_id": 2,
    "marks_obtained": 3,
    "max_marks": 5,
    "co_id": 6,
    "co_number": "CO2"
  }
]
```

## 3. Step-by-Step Algorithm Strategy

### Step 1: Input Validation
- Guard against null, undefined, or empty arrays. If the input is empty, return an empty array instantly to prevent crashes.

### Step 2: Grouping (Map Phase)
- Traverse the array of records.
- For every record, check the `co_id` or `co_number`. 
- Build a running dictionary (Hash Map) where the keys are the `co_number`s (e.g., `"CO1"`).
- Inside each dictionary entry, maintain two running totals:
  - `total_obtained_marks`: Sum of `marks_obtained` across all students and questions.
  - `total_max_marks`: Sum of `max_marks` across all students and questions.

### Step 3: Calculation (Reduce Phase)
- Convert the dictionary back into an output array.
- For each CO grouping, calculate the final average attainment:
  `Percentage = (total_obtained_marks / total_max_marks) * 100`
- Handle potential division-by-zero scenarios (e.g., if a question accidentally has `0` `max_marks`).

### Step 4: Formatting the Output
- Return an array of structured JSON objects.
- Limit decimals to 2 places for display accuracy.

## 4. Expected Output Format
```json
[
  {
    "co_number": "CO1",
    "co_id": 5,
    "attainment_percentage": 80.00
  },
  {
    "co_number": "CO2",
    "co_id": 6,
    "attainment_percentage": 60.00
  }
]
```

## 5. Potential Edge Cases Handled
1. **Missing Data**: If a student missed an exam, `marks_obtained` might be NULL. This must be cast to `0` or dropped so it doesn't wreck the math.
2. **Missing Max Marks**: Catch division by 0 if `max_marks` is somehow invalid.
3. **Unexpected Scale**: Coerce all strings (like `"8.5"`) into safe Javascript Floats prior to addition.
