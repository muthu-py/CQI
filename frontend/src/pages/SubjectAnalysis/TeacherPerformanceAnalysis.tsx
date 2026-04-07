import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';

export type SubjectTeacherPerformanceRow = {
  teacher_id: number | null;
  teacher_name: string;
  avg_score: number;
  co_attainment_score: number;
  student_count: number;
  batch_count: number;
};

export type TeacherBatchPerformanceRow = {
  teacher_id: number | null;
  teacher_name: string;
  batch_id: number | null;
  avg_score: number;
  co_attainment_score: number;
  student_count: number;
};

export type TeacherSectionPerformanceRow = {
  teacher_id: number | null;
  teacher_name: string;
  batch_id: number | null;
  section_id: number | null;
  section_name: string;
  avg_score: number;
  co_attainment_score: number;
  student_count: number;
};

export type TeacherExamTypePerformanceRow = {
  teacher_id: number | null;
  teacher_name: string;
  exam_type: string;
  avg_score: number;
};

export type TeacherPassFailComparisonRow = {
  teacher_id: number | null;
  teacher_name: string;
  student_count: number;
  pass_count: number;
  fail_count: number;
  pass_percentage: number;
  fail_percentage: number;
  avg_score: number;
};

export type TeacherLoadComparisonRow = {
  teacher_id: number | null;
  teacher_name: string;
  student_count: number;
  avg_score: number;
};

export type TeacherConsistencyComparisonRow = {
  teacher_id: number | null;
  teacher_name: string;
  student_count: number;
  avg_score: number;
  score_stddev: number;
  consistency_index: number;
};

type TeacherPerformanceAnalysisProps = {
  subjectTeacherPerformance: SubjectTeacherPerformanceRow[];
  teacherBatchPerformance: TeacherBatchPerformanceRow[];
  teacherSectionPerformance: TeacherSectionPerformanceRow[];
  teacherExamTypePerformance: TeacherExamTypePerformanceRow[];
  teacherPassFailComparison: TeacherPassFailComparisonRow[];
  teacherLoadComparison: TeacherLoadComparisonRow[];
  teacherConsistencyComparison: TeacherConsistencyComparisonRow[];
  selectedTeacherId: string;
  onSelectedTeacherChange: (teacherId: string) => void;
  isBatchScoped: boolean;
};

type TeacherOption = {
  value: string;
  label: string;
};

type ComparisonMode =
  | 'teacher_vs_teacher'
  | 'teacher_vs_batches'
  | 'teacher_vs_sections'
  | 'internal_vs_external'
  | 'pass_vs_fail'
  | 'load_vs_score'
  | 'consistency';

const MODES: { key: ComparisonMode; label: string }[] = [
  { key: 'teacher_vs_teacher', label: 'Teacher vs Teacher' },
  { key: 'teacher_vs_batches', label: 'Teacher vs Batches' },
  { key: 'teacher_vs_sections', label: 'Teacher vs Sections' },
  { key: 'internal_vs_external', label: 'Internal vs External' },
  { key: 'pass_vs_fail', label: 'Pass vs Fail' },
  { key: 'load_vs_score', label: 'Load vs Score' },
  { key: 'consistency', label: 'Consistency' },
];

const normalizeTeacherText = (value: string) => (
  String(value || '')
    .replace(/\.(?=\S)/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
);

const normalizeTeacherLabel = (teacherId: number | null, teacherName: string) => {
  const name = normalizeTeacherText(teacherName);
  if (name) return name;
  return `Teacher ${teacherId ?? 'Unknown'}`;
};

const normalizeBatchLabel = (batchId: number | null) => (
  batchId === null || batchId === undefined
    ? 'Unknown Batch'
    : `Batch ${batchId}`
);

const compactAxisLabel = (value: string, max = 16) => (
  value.length > max ? `${value.slice(0, max - 1)}...` : value
);

const modeNeedsTeacher = (mode: ComparisonMode) => (
  mode === 'teacher_vs_batches' || mode === 'teacher_vs_sections'
);

const modeMeta = (mode: ComparisonMode) => {
  switch (mode) {
    case 'teacher_vs_teacher':
      return {
        title: 'Same Subject, Different Teachers',
        subtitle: 'Average score vs CO attainment score by teacher',
      };
    case 'teacher_vs_batches':
      return {
        title: 'Same Teacher, Different Batches',
        subtitle: 'Batch-wise performance trend for the selected teacher',
      };
    case 'teacher_vs_sections':
      return {
        title: 'Same Teacher, Different Sections',
        subtitle: 'Section-wise comparison for the selected teacher',
      };
    case 'internal_vs_external':
      return {
        title: 'Internal vs External Performance',
        subtitle: 'Teacher-wise split between internal and external exam outcomes',
      };
    case 'pass_vs_fail':
      return {
        title: 'Pass vs Fail Comparison',
        subtitle: 'Teacher-wise pass and fail percentages',
      };
    case 'load_vs_score':
      return {
        title: 'Teaching Load vs Performance',
        subtitle: 'Relationship between student load and average performance',
      };
    case 'consistency':
      return {
        title: 'Teacher Consistency',
        subtitle: 'Consistency index and average score by teacher',
      };
    default:
      return { title: '', subtitle: '' };
  }
};

export function TeacherPerformanceAnalysis({
  subjectTeacherPerformance,
  teacherBatchPerformance,
  teacherSectionPerformance,
  teacherExamTypePerformance,
  teacherPassFailComparison,
  teacherLoadComparison,
  teacherConsistencyComparison,
  selectedTeacherId,
  onSelectedTeacherChange,
  isBatchScoped,
}: TeacherPerformanceAnalysisProps) {
  const [mode, setMode] = useState<ComparisonMode>('teacher_vs_teacher');

  const teacherOptions = useMemo<TeacherOption[]>(() => {
    const map = new Map<string, string>();

    const addTeacher = (teacherId: number | null, teacherName: string) => {
      const key = String(teacherId ?? '');
      if (!key || map.has(key)) return;
      map.set(key, normalizeTeacherLabel(teacherId, teacherName));
    };

    subjectTeacherPerformance.forEach((row) => addTeacher(row.teacher_id, row.teacher_name));
    teacherBatchPerformance.forEach((row) => addTeacher(row.teacher_id, row.teacher_name));
    teacherSectionPerformance.forEach((row) => addTeacher(row.teacher_id, row.teacher_name));
    teacherPassFailComparison.forEach((row) => addTeacher(row.teacher_id, row.teacher_name));

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [
    subjectTeacherPerformance,
    teacherBatchPerformance,
    teacherSectionPerformance,
    teacherPassFailComparison,
  ]);

  const effectiveTeacherId = selectedTeacherId || teacherOptions[0]?.value || '';
  const selectedTeacherName = teacherOptions.find((opt) => opt.value === effectiveTeacherId)?.label || 'Selected Teacher';
  const meta = modeMeta(mode);

  const subjectTeacherChartData = useMemo(() => (
    subjectTeacherPerformance.map((row) => ({
      teacher: normalizeTeacherLabel(row.teacher_id, row.teacher_name),
      avgScore: Number(row.avg_score ?? 0),
      coAttainment: Number(row.co_attainment_score ?? 0),
    }))
  ), [subjectTeacherPerformance]);

  const teacherBatchChartData = useMemo(() => (
    teacherBatchPerformance
      .filter((row) => String(row.teacher_id ?? '') === effectiveTeacherId)
      .map((row) => ({
        batch: normalizeBatchLabel(row.batch_id),
        avgScore: Number(row.avg_score ?? 0),
        coAttainment: Number(row.co_attainment_score ?? 0),
      }))
      .sort((a, b) => a.batch.localeCompare(b.batch))
  ), [teacherBatchPerformance, effectiveTeacherId]);

  const teacherSectionChartData = useMemo(() => (
    teacherSectionPerformance
      .filter((row) => String(row.teacher_id ?? '') === effectiveTeacherId)
      .map((row) => {
        const sectionLabel = String(row.section_name || '').trim() || `Section ${row.section_id ?? 'Unknown'}`;
        return {
          section: isBatchScoped ? sectionLabel : `${normalizeBatchLabel(row.batch_id)} - ${sectionLabel}`,
          avgScore: Number(row.avg_score ?? 0),
          coAttainment: Number(row.co_attainment_score ?? 0),
        };
      })
      .sort((a, b) => a.section.localeCompare(b.section))
  ), [teacherSectionPerformance, effectiveTeacherId, isBatchScoped]);

  const examTypeChartData = useMemo(() => {
    const byTeacher = new Map<string, { teacher: string; internal: number; external: number; other: number }>();

    teacherExamTypePerformance.forEach((row) => {
      const teacher = normalizeTeacherLabel(row.teacher_id, row.teacher_name);
      if (!byTeacher.has(teacher)) {
        byTeacher.set(teacher, { teacher, internal: 0, external: 0, other: 0 });
      }
      const bucket = byTeacher.get(teacher);
      if (!bucket) return;
      const value = Number(row.avg_score ?? 0);
      if (row.exam_type === 'internal') bucket.internal = value;
      else if (row.exam_type === 'external') bucket.external = value;
      else bucket.other = value;
    });

    return Array.from(byTeacher.values()).sort((a, b) => a.teacher.localeCompare(b.teacher));
  }, [teacherExamTypePerformance]);

  const passFailChartData = useMemo(() => (
    teacherPassFailComparison
      .map((row) => ({
        teacher: normalizeTeacherLabel(row.teacher_id, row.teacher_name),
        passPercentage: Number(row.pass_percentage ?? 0),
        failPercentage: Number(row.fail_percentage ?? 0),
      }))
      .sort((a, b) => b.passPercentage - a.passPercentage || a.teacher.localeCompare(b.teacher))
  ), [teacherPassFailComparison]);

  const loadComparisonChartData = useMemo(() => (
    teacherLoadComparison
      .map((row) => ({
        teacher: normalizeTeacherLabel(row.teacher_id, row.teacher_name),
        studentCount: Number(row.student_count ?? 0),
        avgScore: Number(row.avg_score ?? 0),
      }))
      .sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore)
  ), [teacherLoadComparison]);

  const consistencyChartData = useMemo(() => (
    teacherConsistencyComparison
      .map((row) => ({
        teacher: normalizeTeacherLabel(row.teacher_id, row.teacher_name),
        avgScore: Number(row.avg_score ?? 0),
        consistencyIndex: Number(row.consistency_index ?? 0),
        scoreStddev: Number(row.score_stddev ?? 0),
      }))
      .sort((a, b) => b.consistencyIndex - a.consistencyIndex || a.teacher.localeCompare(b.teacher))
  ), [teacherConsistencyComparison]);

  const renderTeacherBars = (
    data: Array<{ [key: string]: string | number }>,
    xKey: string,
    showOther = false
  ) => {
    if (data.length === 0) {
      return (
        <p className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
          No comparison data available.
        </p>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={72}
            tick={{ fontSize: 11, fill: '#566166', fontWeight: 700 }}
            tickFormatter={(value) => compactAxisLabel(String(value))}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
          <Bar dataKey="avgScore" name="Average Score %" fill="#0053db" radius={[4, 4, 0, 0]} barSize={22} />
          <Bar dataKey="coAttainment" name="CO Attainment %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
          {showOther && <Bar dataKey="other" name="Other %" fill="#6b7280" radius={[4, 4, 0, 0]} barSize={22} />}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderActiveChart = () => {
    if (mode === 'teacher_vs_teacher') {
      return renderTeacherBars(subjectTeacherChartData as Array<{ [key: string]: string | number }>, 'teacher');
    }

    if (mode === 'teacher_vs_batches') {
      return renderTeacherBars(teacherBatchChartData as Array<{ [key: string]: string | number }>, 'batch');
    }

    if (mode === 'teacher_vs_sections') {
      return renderTeacherBars(teacherSectionChartData as Array<{ [key: string]: string | number }>, 'section');
    }

    if (mode === 'internal_vs_external') {
      if (examTypeChartData.length === 0) {
        return (
          <p className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
            No exam-type comparison data available.
          </p>
        );
      }

      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={examTypeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
            <XAxis
              dataKey="teacher"
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={72}
              tick={{ fontSize: 11, fill: '#566166', fontWeight: 700 }}
              tickFormatter={(value) => compactAxisLabel(String(value))}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
            <Bar dataKey="internal" name="Internal %" fill="#0053db" radius={[4, 4, 0, 0]} barSize={22} />
            <Bar dataKey="external" name="External %" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
            <Bar dataKey="other" name="Other %" fill="#6b7280" radius={[4, 4, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (mode === 'pass_vs_fail') {
      if (passFailChartData.length === 0) {
        return (
          <p className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
            No pass/fail data available.
          </p>
        );
      }

      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={passFailChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
            <XAxis
              dataKey="teacher"
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={72}
              tick={{ fontSize: 11, fill: '#566166', fontWeight: 700 }}
              tickFormatter={(value) => compactAxisLabel(String(value))}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
            <Bar dataKey="passPercentage" name="Pass %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
            <Bar dataKey="failPercentage" name="Fail %" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (mode === 'load_vs_score') {
      if (loadComparisonChartData.length === 0) {
        return (
          <p className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
            No load comparison data available.
          </p>
        );
      }

      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={loadComparisonChartData} margin={{ top: 10, right: 15, left: -25, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
            <XAxis
              dataKey="teacher"
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={72}
              tick={{ fontSize: 11, fill: '#566166', fontWeight: 700 }}
              tickFormatter={(value) => compactAxisLabel(String(value))}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
            <Bar yAxisId="left" dataKey="studentCount" name="Student Count" fill="#64748b" radius={[4, 4, 0, 0]} barSize={24} />
            <Line yAxisId="right" dataKey="avgScore" name="Average Score %" stroke="#0053db" strokeWidth={2.5} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    if (consistencyChartData.length === 0) {
      return (
        <p className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
          No consistency data available.
        </p>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={consistencyChartData} margin={{ top: 10, right: 15, left: -25, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
          <XAxis
            dataKey="teacher"
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={72}
            tick={{ fontSize: 11, fill: '#566166', fontWeight: 700 }}
            tickFormatter={(value) => compactAxisLabel(String(value))}
          />
          <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value, name) => {
              if (name === 'Std Deviation') return [`${value}`, name];
              return [`${value}%`, name];
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
          <Bar yAxisId="left" dataKey="consistencyIndex" name="Consistency Index %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
          <Line yAxisId="left" dataKey="avgScore" name="Average Score %" stroke="#0053db" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line yAxisId="right" dataKey="scoreStddev" name="Std Deviation" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <section className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-6">
        <h3 className="text-lg font-bold text-on-surface">Teacher Performance Analysis</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          All teacher-performance comparisons are available as separate options below.
        </p>
        {isBatchScoped && (
          <p className="text-[11px] text-on-surface-variant mt-3 italic">
            Batch scope is applied except for Teacher vs Batches, which intentionally compares across all batches for the selected subject.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {MODES.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setMode(entry.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === entry.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-on-surface">{meta.title}</h4>
            <p className="text-xs text-on-surface-variant mt-1">{meta.subtitle}</p>
          </div>

          {modeNeedsTeacher(mode) && (
            <div className="flex flex-col gap-1.5 min-w-56">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Teacher
              </label>
              <select
                value={effectiveTeacherId}
                disabled={teacherOptions.length === 0}
                onChange={(e) => onSelectedTeacherChange(e.target.value)}
                className="block bg-surface-container-low border-none rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm font-medium disabled:opacity-50"
              >
                {teacherOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {modeNeedsTeacher(mode) && (
          <p className="text-xs text-primary font-semibold mt-3">{selectedTeacherName}</p>
        )}

        <div className="h-80 mt-5">
          {renderActiveChart()}
        </div>
      </div>

      {mode === 'load_vs_score' && loadComparisonChartData.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <h5 className="text-sm font-bold text-on-surface mb-2">Load Scatter Preview</h5>
          <p className="text-xs text-on-surface-variant mb-4">Higher right and higher up generally indicates better load handling.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: -5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e9ee" />
                <XAxis type="number" dataKey="studentCount" name="Student Count" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="avgScore" name="Average Score" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [name === 'avgScore' ? `${value}%` : value, name === 'avgScore' ? 'Average Score' : 'Student Count']}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload?.teacher ? `Teacher: ${payload[0].payload.teacher}` : '')}
                />
                <Scatter name="Teachers" data={loadComparisonChartData} fill="#0053db" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
