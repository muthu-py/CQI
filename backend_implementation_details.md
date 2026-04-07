# CQI Backend Implementation Details - Analysis Engine

This document provides a comprehensive overview of the backend features implemented in the CQI (Continuous Quality Improvement) Analytics project. The backend is designed as a modular **Analytics Engine** that consumes raw academic data and transforms it into actionable metrics.

---

## 🚀 Core Backend Architecture

- **Technology Stack**: Node.js (Express), PostgreSQL (via Supabase), Bun (as runner).
- **Architecture**: Separated into **Controllers** (API routing), **Services** (Data Orchestration), and **Analysis Logic** (Mathematical Computation).
- **Data Strategy**: Pure function-based analysis logic ensures that mathematical computations are isolated from database side-effects.

---

## 📊 Analytics Features

### 1. **Student Performance Engine**
- **Implementation**: `analysis/performance/performance.js` & `server/services/performanceService.js`
- **Functionality**:
    - Calculates Average Internal and External marks as percentages.
    - Computes the **Performance Gap** (the discrepancy between continuous internal assessment and terminal external exams).
    - Supports contextual filtering by Subject Offering, Batch, and Student ID.

### 2. **CO (Course Outcome) Attainment**
- **Implementation**: `analysis/co_attainment/coAttainment.js` & `server/services/coAttainmentService.js`
- **Functionality**:
    - Aggregates student scores at the question level and maps them to specific COs.
    - Calculates **Attainment Percentage** for CO1-CO5 based on total obtained marks vs. maximum possible marks.
    - Preserves cohort boundaries across different batches and regulations.

### 3. **PO (Program Outcome) Attainment**
- **Implementation**: `analysis/po_attainment/poAttainment.js` & `server/services/poAttainmentService.js`
- **Functionality**:
    - Maps question-level marks to Program Outcomes (PO1-PO12).
    - Utilizes a **Weighted Scaled Algorithm** to translate granular marks into high-level PO attainment.
    - Critical for institutional accreditation (NBA/NAAC) reporting.

### 4. **Attendance-Performance Correlation**
- **Implementation**: `analysis/attendance/attendance.js` & `server/services/attendanceService.js`
- **Functionality**:
    - Computes **Weighted Attendance Scores** based on regulatory rules.
    - Maps attendance percentages to performance buckets (>90%, 80-90%, etc.).

### 5. **Teacher & Faculty Analysis**
- **Implementation**: `analysis/teacher/teacher.js` & `server/services/teacherService.js`
- **Functionality**:
    - Evaluates faculty effectiveness by aggregating student performance in their respective subject offerings.
    - Tracks **Curriculum Mapping Effectiveness** by measuring how well students attain COs under a specific teacher.

### 6. **Comparative Analytics Suite**
- **Implementation**: `analysis/comparisons/comparison.js` & `server/services/comparisonService.js`
- **Functionality**:
    - **Section Comparison**: Metrics across different class sections (e.g., Section A vs. B).
    - **Batch/Regulation Comparison**: Comparison of cohort performance across different curriculums.
    - **Attendance vs Performance**: Correlation analysis to identify if higher attendance leads to significantly better grades.

---

## 🗄️ Inferred Database Schema (Implicit)

Based on the implemented queries, the system operates on a relational schema including:

| Table | Purpose |
|---|---|
| `student_component_marks` | Aggregated marks for evaluation components (MID, SEM). |
| `student_question_marks` | Granular question-level scores for mapping logic. |
| `question_co_po_map` | The "Brain" of the CQI — mapping questions to outcomes. |
| `exam` / `evaluation_component` | Contextual metadata for assessments. |
| `subject_offering` | Links subjects, teachers, batches, and regulations. |
| `student_attendance` | Daily or aggregate attendance records per student. |
| `attendance_rule` | Weightage logic for different attendance brackets. |

---

## 🛠️ Design Patterns Applied

1. **Pure Function Analysis**: All mathematical logic in the `analysis/` folder is stateless and testable.
2. **Contextual Filtering**: API endpoints dynamically adjust SQL joins based on provided query parameters (Regulation, Batch, Subject).
3. **Map-Reduce Strategy**: Data is fetched as flat tables and "reduced" in the service layer to produce hierarchical JSON for the frontend.
