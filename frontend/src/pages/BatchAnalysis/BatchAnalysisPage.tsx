import { useEffect, useState, useMemo } from 'react';
import { FilterPanel, FilterSelect } from '../../components/ui/FilterSelect';
import { SectionMarksCard, type SectionMarksData } from './SectionMarksCard';
import { SectionAttendanceCard, type SectionAttendanceData } from './SectionAttendanceCard';
import { analyticsService, type Filters } from '../../services/api';

// Section display order — always A, B, C
const SECTION_ORDER = ['A', 'B', 'C'];

type Tab = 'marks' | 'attendance';

interface BatchMarksResponse {
  batches: Record<string, { sections: Record<string, SectionMarksData> }>;
}

interface BatchAttendanceResponse {
  batches: Record<string, { sections: Record<string, SectionAttendanceData> }>;
}

export function BatchAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<any>({ regulations: [], subjects: [], batches: [] });
  const [activeTab, setActiveTab] = useState<Tab>('marks');

  const [loading, setLoading] = useState(false);
  const [marksData, setMarksData] = useState<BatchMarksResponse | null>(null);
  const [attendanceData, setAttendanceData] = useState<BatchAttendanceResponse | null>(null);

  useEffect(() => {
    analyticsService.getFilterOptions({}).then(res => setFilterOptions(res.data)).catch(console.error);
  }, []);

  const fetchData = async () => {
    if (!filters.regulation_id || !filters.subject_id) return;
    setLoading(true);
    try {
      const [marksRes, attRes] = await Promise.all([
        analyticsService.getBatchMarks(filters),
        analyticsService.getBatchAttendance(filters),
      ]);
      setMarksData(marksRes.data as BatchMarksResponse);
      setAttendanceData(attRes.data as BatchAttendanceResponse);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sorted batch IDs — always derived from marksData (the primary loaded source).
  // Switching tabs must NOT reset batchIds, otherwise the UI falsely shows "no data".
  const batchIds = useMemo(() => {
    const source = marksData?.batches;
    if (!source) return [];
    return Object.keys(source).sort((a, b) => Number(a) - Number(b));
  }, [marksData]);

  // Scope label
  const scopeLabel = filters.batch_id
    ? `Batch ${filters.batch_id}`
    : 'All Batches';

  // Summary stats across all sections
  const summaryStats = useMemo(() => {
    if (activeTab === 'marks' && marksData) {
      let totalStudents = 0, totalPassed = 0, totalPctSum = 0, sectionCount = 0;
      for (const batchObj of Object.values(marksData.batches)) {
        for (const sec of Object.values(batchObj.sections)) {
          totalStudents += sec.student_count;
          totalPassed += sec.pass_count;
          if (sec.student_count > 0) { totalPctSum += sec.avg_percentage; sectionCount++; }
        }
      }
      const overallAvg = sectionCount > 0 ? totalPctSum / sectionCount : 0;
      const passRate = totalStudents > 0 ? (totalPassed / totalStudents) * 100 : 0;
      return { totalStudents, overallAvg, passRate, label: 'Avg Marks', subLabel: 'Pass Rate' };
    }
    if (activeTab === 'attendance' && attendanceData) {
      let totalStudents = 0, totalBelow75 = 0, totalAttSum = 0, sectionCount = 0;
      for (const batchObj of Object.values(attendanceData.batches ?? {})) {
        for (const sec of Object.values(batchObj?.sections ?? {})) {
          totalStudents += sec.student_count ?? 0;
          totalBelow75 += sec.below_75_count ?? 0;
          if (sec.student_count > 0) { totalAttSum += sec.avg_attendance ?? 0; sectionCount++; }
        }
      }
      const overallAvg = sectionCount > 0 ? totalAttSum / sectionCount : 0;
      const atRiskRate = totalStudents > 0 ? (totalBelow75 / totalStudents) * 100 : 0;
      return { totalStudents, overallAvg, passRate: atRiskRate, label: 'Avg Attendance', subLabel: 'At Risk (<75%)' };
    }
    return null;
  }, [activeTab, marksData, attendanceData]);

  const hasData = batchIds.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filter Panel */}
      <FilterPanel
        actions={
          <button
            onClick={fetchData}
            disabled={!filters.regulation_id || !filters.subject_id || loading}
            className="px-6 py-2 bg-gradient-to-br from-primary to-primary-dim text-white rounded-lg font-medium shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Analyse'}
          </button>
        }
      >
        <FilterSelect
          label="Regulation"
          value={filters.regulation_id || ''}
          onChange={e => setFilters(f => ({ ...f, regulation_id: e.target.value, batch_id: undefined }))}
          options={filterOptions.regulations?.map((r: any) => ({ value: r.regulation_id, label: r.label })) || []}
        />
        <FilterSelect
          label="Subject" widthClass="w-56"
          value={filters.subject_id || ''}
          onChange={e => setFilters(f => ({ ...f, subject_id: e.target.value }))}
          options={filterOptions.subjects?.map((s: any) => ({ value: s.subject_id, label: s.subject_name })) || []}
        />
        <FilterSelect
          label="Batch (Optional)"
          value={filters.batch_id || ''}
          onChange={e => setFilters(f => ({ ...f, batch_id: e.target.value || undefined }))}
          options={[
            { value: '', label: 'All Batches' },
            ...(filterOptions.batches?.map((b: any) => ({ value: b.batch_id, label: `Batch ${b.batch_id}` })) || [])
          ]}
        />
      </FilterPanel>

      {/* Summary stat bar (only when data available) */}
      {hasData && summaryStats && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Scope</p>
            <p className="text-sm font-semibold text-on-surface">{scopeLabel}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total Students</p>
            <p className="text-2xl font-black text-primary">{summaryStats.totalStudents}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">{summaryStats.label}</p>
            <p className="text-2xl font-black text-primary">{summaryStats.overallAvg.toFixed(1)}%</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">{summaryStats.subLabel}</p>
            <p className={`text-2xl font-black ${activeTab === 'attendance' && summaryStats.passRate > 20 ? 'text-red-500' : 'text-primary'}`}>
              {summaryStats.passRate.toFixed(1)}%
            </p>
          </div>
        </section>
      )}

      {/* Tab switcher */}
      {hasData && (
        <div className="flex gap-2">
          {(['marks', 'attendance'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab === 'marks' ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">grade</span>
                  Marks Analysis
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">event_available</span>
                  Attendance Analysis
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main content: sections per batch */}
      {!hasData && !loading && (
        <div className="bg-surface-container-lowest rounded-2xl p-16 flex flex-col items-center justify-center gap-3 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-40">school</span>
          <p className="text-on-surface-variant text-sm font-medium">
            Select a <strong>Regulation</strong> and <strong>Subject</strong>, then click <em>Analyse</em>.
          </p>
          <p className="text-on-surface-variant text-xs opacity-60">
            Optionally pick a Batch to see only that batch's sections.
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-surface-container-lowest rounded-2xl p-16 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant text-sm font-medium">Crunching data…</p>
        </div>
      )}

      {/* Marks tab */}
      {!loading && hasData && activeTab === 'marks' && marksData && batchIds.map(batchId => {
        const batchObj = marksData.batches[batchId];
        if (!batchObj?.sections) return null; // guard: batch exists in batchIds but not in marksData
        const sectionNames = SECTION_ORDER.filter(s => s in batchObj.sections);

        return (
          <div key={batchId} className="space-y-4">
            {/* Batch header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-base">groups</span>
              </div>
              <h2 className="text-lg font-bold text-on-surface">Batch {batchId}</h2>
              <div className="flex-1 h-px bg-outline/10" />
              <span className="text-xs text-on-surface-variant">{sectionNames.length} section(s)</span>
            </div>

            {/* Section cards grid: 1 col on mobile, 3 col on lg */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sectionNames.map(sec => (
                <SectionMarksCard
                  key={`${batchId}-${sec}`}
                  batchId={batchId}
                  sectionName={sec}
                  data={batchObj.sections[sec]}
                />
              ))}
              {/* If a section is missing in the DB, show placeholder */}
              {SECTION_ORDER.filter(s => !(s in batchObj.sections)).map(sec => (
                <div key={`${batchId}-${sec}-empty`} className="rounded-2xl border-dashed border-2 border-outline/20 flex items-center justify-center p-8 text-on-surface-variant text-sm opacity-50">
                  Section {sec} — No data
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Attendance tab */}
      {!loading && hasData && activeTab === 'attendance' && batchIds.map(batchId => {
        const batchObj = attendanceData?.batches?.[batchId];
        if (!batchObj?.sections) {
          // Batch exists in marks data but not in attendance data — show a placeholder row
          return (
            <div key={batchId} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base">groups</span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">Batch {batchId}</h2>
                <div className="flex-1 h-px bg-outline/10" />
                <span className="text-xs text-on-surface-variant">No attendance data</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SECTION_ORDER.map(sec => (
                  <div key={`${batchId}-${sec}-empty`} className="rounded-2xl border-dashed border-2 border-outline/20 flex items-center justify-center p-8 text-on-surface-variant text-sm opacity-50">
                    Section {sec} — No attendance data
                  </div>
                ))}
              </div>
            </div>
          );
        }
        const sectionNames = SECTION_ORDER.filter(s => s in batchObj.sections);

        return (
          <div key={batchId} className="space-y-4">
            {/* Batch header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-base">groups</span>
              </div>
              <h2 className="text-lg font-bold text-on-surface">Batch {batchId}</h2>
              <div className="flex-1 h-px bg-outline/10" />
              <span className="text-xs text-on-surface-variant">{sectionNames.length} section(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sectionNames.map(sec => (
                <SectionAttendanceCard
                  key={`${batchId}-${sec}`}
                  batchId={batchId}
                  sectionName={sec}
                  data={batchObj.sections[sec]}
                />
              ))}
              {SECTION_ORDER.filter(s => !(s in batchObj.sections)).map(sec => (
                <div key={`${batchId}-${sec}-empty`} className="rounded-2xl border-dashed border-2 border-outline/20 flex items-center justify-center p-8 text-on-surface-variant text-sm opacity-50">
                  Section {sec} — No data
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
