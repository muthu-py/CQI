const { computeCoAttainment } = require('../coAttainment.js');

const mockData = [
  // CO1 questions (Normal scenario)
  { student_id: 1, question_id: 101, marks_obtained: 8, max_marks: 10, co_id: 1, co_number: "CO1" },
  { student_id: 2, question_id: 101, marks_obtained: 9, max_marks: 10, co_id: 1, co_number: "CO1" },
  { student_id: 1, question_id: 102, marks_obtained: 4, max_marks:  5, co_id: 1, co_number: "CO1" }, 
  // Expected CO1: Total obtained = 8+9+4 = 21. Total max = 10+10+5 = 25. Attainment = (21/25)*100 = 84.00%

  // CO2 questions (Low scores)
  { student_id: 1, question_id: 103, marks_obtained: 3, max_marks: 10, co_id: 2, co_number: "CO2" },
  { student_id: 2, question_id: 103, marks_obtained: 2, max_marks: 10, co_id: 2, co_number: "CO2" },
  // Expected CO2: Total obtained = 5. Total max = 20. Attainment = 25.00%
  
  // Edge case (Missing/string types for CO3)
  { student_id: 3, question_id: 104, marks_obtained: "null", max_marks: "10", co_id: 3, co_number: "CO3" },
  { student_id: 4, question_id: 104, marks_obtained: "5.5", max_marks: "10", co_id: 3, co_number: "CO3" }
  // Expected CO3: Total obtained = 0 + 5.5 = 5.5. Total max = 10 + 10 = 20. Attainment = 27.50%
];

console.log("Mock Input Data:", JSON.stringify(mockData, null, 2));
console.log("\n--- Executing computeCoAttainment() ---");
const result = computeCoAttainment(mockData);
console.log("\nOutput Result:", JSON.stringify(result, null, 2));
