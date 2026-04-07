-- CQI Performance Indexes (v1)
-- Run once in Supabase SQL editor.

CREATE INDEX IF NOT EXISTS idx_subject_offering_scope
  ON subject_offering (regulation_id, subject_id, batch_id, offering_id);

CREATE INDEX IF NOT EXISTS idx_exam_offering_component
  ON exam (offering_id, component_id);

CREATE INDEX IF NOT EXISTS idx_question_exam
  ON question (exam_id);

CREATE INDEX IF NOT EXISTS idx_student_question_marks_question_student
  ON student_question_marks (question_id, student_id);

CREATE INDEX IF NOT EXISTS idx_question_co_po_map_question
  ON question_co_po_map (question_id, co_id, po_id);

CREATE INDEX IF NOT EXISTS idx_subject_co_po_map_scope
  ON subject_co_po_map (regulation_id, subject_id, co_id, po_id);

CREATE INDEX IF NOT EXISTS idx_student_component_marks_exam_student
  ON student_component_marks (exam_id, student_id);

CREATE INDEX IF NOT EXISTS idx_student_attendance_scope
  ON student_attendance (offering_id, component_id, student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_rule_scope
  ON attendance_rule (regulation_id, subject_type, component_id);
