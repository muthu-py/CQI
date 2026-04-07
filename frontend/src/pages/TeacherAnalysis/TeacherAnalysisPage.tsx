import { useEffect, useState } from 'react';
import { FilterPanel, FilterSelect } from '../../components/ui/FilterSelect';
import {
  TeacherPerformanceAnalysis,
  type SubjectTeacherPerformanceRow,
  type TeacherBatchPerformanceRow,
  type TeacherSectionPerformanceRow,
  type TeacherExamTypePerformanceRow,
  type TeacherPassFailComparisonRow,
  type TeacherLoadComparisonRow,
  type TeacherConsistencyComparisonRow,
} from '../SubjectAnalysis/TeacherPerformanceAnalysis';
import { analyticsService, type Filters } from '../../services/api';

export function TeacherAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<any>({ regulations: [], subjects: [], batches: [] });

  const [loading, setLoading] = useState(false);
  const [subjectTeacherPerformance, setSubjectTeacherPerformance] = useState<SubjectTeacherPerformanceRow[]>([]);
  const [teacherBatchPerformance, setTeacherBatchPerformance] = useState<TeacherBatchPerformanceRow[]>([]);
  const [teacherSectionPerformance, setTeacherSectionPerformance] = useState<TeacherSectionPerformanceRow[]>([]);
  const [teacherExamTypePerformance, setTeacherExamTypePerformance] = useState<TeacherExamTypePerformanceRow[]>([]);
  const [teacherPassFailComparison, setTeacherPassFailComparison] = useState<TeacherPassFailComparisonRow[]>([]);
  const [teacherLoadComparison, setTeacherLoadComparison] = useState<TeacherLoadComparisonRow[]>([]);
  const [teacherConsistencyComparison, setTeacherConsistencyComparison] = useState<TeacherConsistencyComparisonRow[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    analyticsService.getFilterOptions({}).then((res) => setFilterOptions(res.data)).catch(console.error);
  }, []);

  const fetchData = async () => {
    if (!filters.regulation_id || !filters.subject_id) return;
    setLoading(true);
    try {
      const teacherInsightsRes = await analyticsService.getTeacherPerformanceInsights(filters);
      const teacherInsights = teacherInsightsRes?.data && typeof teacherInsightsRes.data === 'object'
        ? teacherInsightsRes.data
        : {};

      const subjectTeacherRows = Array.isArray(teacherInsights?.subject_teacher_performance)
        ? teacherInsights.subject_teacher_performance
        : [];
      const teacherBatchRows = Array.isArray(teacherInsights?.teacher_batch_performance)
        ? teacherInsights.teacher_batch_performance
        : [];
      const teacherSectionRows = Array.isArray(teacherInsights?.teacher_section_performance)
        ? teacherInsights.teacher_section_performance
        : [];
      const teacherExamTypeRows = Array.isArray(teacherInsights?.teacher_exam_type_performance)
        ? teacherInsights.teacher_exam_type_performance
        : [];
      const teacherPassFailRows = Array.isArray(teacherInsights?.teacher_pass_fail_comparison)
        ? teacherInsights.teacher_pass_fail_comparison
        : [];
      const teacherLoadRows = Array.isArray(teacherInsights?.teacher_load_comparison)
        ? teacherInsights.teacher_load_comparison
        : [];
      const teacherConsistencyRows = Array.isArray(teacherInsights?.teacher_consistency_comparison)
        ? teacherInsights.teacher_consistency_comparison
        : [];

      setSubjectTeacherPerformance(subjectTeacherRows);
      setTeacherBatchPerformance(teacherBatchRows);
      setTeacherSectionPerformance(teacherSectionRows);
      setTeacherExamTypePerformance(teacherExamTypeRows);
      setTeacherPassFailComparison(teacherPassFailRows);
      setTeacherLoadComparison(teacherLoadRows);
      setTeacherConsistencyComparison(teacherConsistencyRows);

      const defaultTeacherId = teacherInsights?.default_teacher_id;
      if (defaultTeacherId !== undefined && defaultTeacherId !== null) {
        setSelectedTeacherId(String(defaultTeacherId));
      } else if (subjectTeacherRows.length > 0) {
        setSelectedTeacherId(String(subjectTeacherRows[0].teacher_id ?? ''));
      } else if (teacherBatchRows.length > 0) {
        setSelectedTeacherId(String(teacherBatchRows[0].teacher_id ?? ''));
      } else {
        setSelectedTeacherId('');
      }
    } catch (error) {
      console.error(error);
      setSubjectTeacherPerformance([]);
      setTeacherBatchPerformance([]);
      setTeacherSectionPerformance([]);
      setTeacherExamTypePerformance([]);
      setTeacherPassFailComparison([]);
      setTeacherLoadComparison([]);
      setTeacherConsistencyComparison([]);
      setSelectedTeacherId('');
    } finally {
      setLoading(false);
    }
  };

  const scopeLabel = filters.batch_id
    ? `Batch ${filters.batch_id}`
    : 'All Batches';

  return (
    <div className="space-y-8 animate-fade-in">
      <FilterPanel
        actions={
          <button
            onClick={fetchData}
            disabled={!filters.regulation_id || !filters.subject_id || loading}
            className="px-6 py-2 bg-gradient-to-br from-primary to-primary-dim text-white rounded-lg font-medium shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Analyze Teachers'}
          </button>
        }
      >
        <FilterSelect
          label="Regulation"
          value={filters.regulation_id || ''}
          onChange={(e) => setFilters((f) => ({ ...f, regulation_id: e.target.value }))}
          options={filterOptions.regulations?.map((r: any) => ({ value: r.regulation_id, label: r.label })) || []}
        />
        <FilterSelect
          label="Academic Batch (Optional)"
          value={filters.batch_id || ''}
          onChange={(e) => setFilters((f) => ({ ...f, batch_id: e.target.value || undefined }))}
          options={filterOptions.batches?.map((b: any) => ({ value: b.batch_id, label: b.batch_id })) || []}
        />
        <FilterSelect
          label="Subject"
          widthClass="w-56"
          value={filters.subject_id || ''}
          onChange={(e) => setFilters((f) => ({ ...f, subject_id: e.target.value }))}
          options={filterOptions.subjects?.map((s: any) => ({ value: s.subject_id, label: s.subject_name })) || []}
        />
      </FilterPanel>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Scope</p>
          <p className="text-sm font-semibold text-on-surface">{scopeLabel}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Teachers</p>
          <p className="text-2xl font-black text-primary">{subjectTeacherPerformance.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Selected Subject</p>
          <p className="text-sm font-semibold text-on-surface">
            {filters.subject_id ? `Subject ${filters.subject_id}` : 'Not selected'}
          </p>
        </div>
      </section>

      <TeacherPerformanceAnalysis
        subjectTeacherPerformance={subjectTeacherPerformance}
        teacherBatchPerformance={teacherBatchPerformance}
        teacherSectionPerformance={teacherSectionPerformance}
        teacherExamTypePerformance={teacherExamTypePerformance}
        teacherPassFailComparison={teacherPassFailComparison}
        teacherLoadComparison={teacherLoadComparison}
        teacherConsistencyComparison={teacherConsistencyComparison}
        selectedTeacherId={selectedTeacherId}
        onSelectedTeacherChange={setSelectedTeacherId}
        isBatchScoped={Boolean(filters.batch_id)}
      />
    </div>
  );
}
