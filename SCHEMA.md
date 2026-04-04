# CQI Analytics Engine Database Schema & Architecture

This document serves as the single source of truth for the Database Schema understanding, governing the data-fetching and analysis rules for the CQI Analytics Engine.

## System Design Principle
The backend follows a strictly decoupled approach:
- **Database (PostgreSQL)**: Serves exclusively as data storage.
- **Backend (Node.js)**: Acts as the primary computation engine. 

All analytics calculations are done cleanly mapping and reducing data in pure JavaScript functions, adhering to the principle of "fetch minimal required data, and calculate in Node".

---

## Key Data Insights

### 1. The Central Anchor: `SUBJECT_OFFERING`
Almost all analytics (performance, attendance, teacher evaluations) revolve around the `SUBJECT_OFFERING` entity. It effectively links:
- Who is teaching (`TEACHER`)
- What is being taught (`SUBJECT`)
- Who is learning (`BATCH`, `SECTION`)
- When it is taught (`SEMESTER`)
- Under which curriculum version (`REGULATION`)

Grouping SQL queries by `offering_id` is the primary filtering and entry point.

### 2. Regulatory Constraints
Both Course Outcomes (`CO`), Program Outcomes (`PO`), and `ATTENDANCE_RULE`s are strictly tied to a `REGULATION`. This guarantees that analysis inherently respects modifications to the syllabus or weightage over academic years.

### 3. Granularity of Evaluation
Rather than computing broad generalizations at the SQL level, we rely on the lowest possible bounds:
- **`STUDENT_QUESTION_MARKS`**: Marks tracked against individual questions.
- **`QUESTION_CO_PO_MAP`**: Questions are precisely linked to COs and POs with specific weightages.
  
*Data Flow:* `Student` -> `Question` -> `Marks` -> Node.js JS Compute -> `CO Attainment` -> `PO Attainment`.

### 4. Curriculum Target Baseline: `SUBJECT_CO_PO_MAP`
This static table represents the academic foundation or "desired mapping" defined by the syllabus or faculty.
- **Purpose**: It defines how strongly a Course Outcome (CO) contributes to a Program Outcome (PO) (with weightages typically 1–3) for a specific subject under a specific regulation.
- **Nature**: It is a macro-level, static curriculum target enforcing a unique constraint on `(subject_id, regulation_id, co_id, po_id)`, standing as the baseline to compare actual granular student performance against.

---

## Entity Relationship Diagram

```mermaid
erDiagram

%% =========================
%% CORE ACADEMIC STRUCTURE
%% =========================

REGULATION {
    int regulation_id PK
    int start_year
    int end_year
}

BATCH {
    int batch_id PK
    int start_year
    int end_year
}

SECTION {
    int section_id PK
    int batch_id FK
    string name
}

SEMESTER {
    int semester_id PK
}

SUBJECT {
    int subject_id PK
    string subject_name
    string subject_type
}

SEMESTER_SUBJECT {
    int id PK
    int semester_id FK
    int subject_id FK
    int regulation_id FK
}

%% =========================
%% PEOPLE
%% =========================

STUDENT {
    int student_id PK
    string name
    string roll_number
    int section_id FK
    int batch_id FK
    int regulation_id FK
}

TEACHER {
    int teacher_id PK
    string name
    string email
}

%% =========================
%% SUBJECT OFFERING
%% =========================

SUBJECT_OFFERING {
    int offering_id PK
    int subject_id FK
    int teacher_id FK
    int semester_id FK
    int batch_id FK
    int section_id FK
    int regulation_id FK
}

%% =========================
%% EVALUATION SYSTEM
%% =========================

EVALUATION_COMPONENT {
    int component_id PK
    string name
    string type
}

EXAM {
    int exam_id PK
    int offering_id FK
    int component_id FK
    date exam_date
    int max_marks
}

QUESTION {
    int question_id PK
    int exam_id FK
    int max_marks
}

%% =========================
%% CO / PO (REGULATION BASED)
%% =========================

CO {
    int co_id PK
    int subject_id FK
    int regulation_id FK
    string co_number
    string description
}

PO {
    int po_id PK
    int regulation_id FK
    string po_number
    string description
}

SUBJECT_CO_PO_MAP {
    int id PK
    int subject_id FK
    int regulation_id FK
    int co_id FK
    int po_id FK
    float weightage
}

QUESTION_CO_PO_MAP {
    int id PK
    int question_id FK
    int co_id FK
    int po_id FK
    float weightage
}

%% =========================
%% MARKS
%% =========================

STUDENT_QUESTION_MARKS {
    int id PK
    int student_id FK
    int question_id FK
    float marks_obtained
}

STUDENT_COMPONENT_MARKS {
    int id PK
    int student_id FK
    int exam_id FK
    float total_marks
}

%% =========================
%% ATTENDANCE
%% =========================

STUDENT_ATTENDANCE {
    int id PK
    int student_id FK
    int offering_id FK
    int component_id FK
    float attendance_percentage
}

ATTENDANCE_RULE {
    int rule_id PK
    int regulation_id FK
    string subject_type
    int component_id FK
    float weightage
}

%% =========================
%% ANALYTICS
%% =========================

ANALYTICS_SNAPSHOT {
    int id PK
    int offering_id FK
    int section_id FK
    int co_id FK
    int po_id FK
    float avg_marks
    float attainment_level
    datetime created_at
}

TEACHER_PERFORMANCE {
    int id PK
    int teacher_id FK
    int subject_id FK
    int batch_id FK
    int section_id FK
    float avg_score
    float co_attainment_score
}

%% =========================
%% RELATIONSHIPS
%% =========================

BATCH ||--o{ SECTION : has
BATCH ||--o{ STUDENT : has
REGULATION ||--o{ STUDENT : follows

SECTION ||--o{ STUDENT : contains

SEMESTER ||--o{ SEMESTER_SUBJECT : includes
SUBJECT ||--o{ SEMESTER_SUBJECT : mapped_to
REGULATION ||--o{ SEMESTER_SUBJECT : applies_to

SUBJECT ||--o{ SUBJECT_OFFERING : offered_as
TEACHER ||--o{ SUBJECT_OFFERING : teaches
SEMESTER ||--o{ SUBJECT_OFFERING : in
BATCH ||--o{ SUBJECT_OFFERING : for
SECTION ||--o{ SUBJECT_OFFERING : section
REGULATION ||--o{ SUBJECT_OFFERING : follows

SUBJECT_OFFERING ||--o{ EXAM : has
EVALUATION_COMPONENT ||--o{ EXAM : defines

EXAM ||--o{ QUESTION : contains

SUBJECT ||--o{ CO : defines
REGULATION ||--o{ CO : varies_by

REGULATION ||--o{ PO : defines

QUESTION ||--o{ QUESTION_CO_PO_MAP : mapped_to
CO ||--o{ QUESTION_CO_PO_MAP : linked
PO ||--o{ QUESTION_CO_PO_MAP : linked

SUBJECT ||--o{ SUBJECT_CO_PO_MAP : mapped_to
REGULATION ||--o{ SUBJECT_CO_PO_MAP : follows
CO ||--o{ SUBJECT_CO_PO_MAP : linked
PO ||--o{ SUBJECT_CO_PO_MAP : linked

STUDENT ||--o{ STUDENT_QUESTION_MARKS : gets
QUESTION ||--o{ STUDENT_QUESTION_MARKS : evaluated_by

STUDENT ||--o{ STUDENT_COMPONENT_MARKS : has
EXAM ||--o{ STUDENT_COMPONENT_MARKS : summarized_from

STUDENT ||--o{ STUDENT_ATTENDANCE : has
SUBJECT_OFFERING ||--o{ STUDENT_ATTENDANCE : for
EVALUATION_COMPONENT ||--o{ STUDENT_ATTENDANCE : based_on

REGULATION ||--o{ ATTENDANCE_RULE : defines
EVALUATION_COMPONENT ||--o{ ATTENDANCE_RULE : uses

SUBJECT_OFFERING ||--o{ ANALYTICS_SNAPSHOT : produces
SECTION ||--o{ ANALYTICS_SNAPSHOT : grouped_by
CO ||--o{ ANALYTICS_SNAPSHOT : tracks
PO ||--o{ ANALYTICS_SNAPSHOT : tracks

TEACHER ||--o{ TEACHER_PERFORMANCE : evaluated
SUBJECT ||--o{ TEACHER_PERFORMANCE : for
BATCH ||--o{ TEACHER_PERFORMANCE : across
SECTION ||--o{ TEACHER_PERFORMANCE : section
```
