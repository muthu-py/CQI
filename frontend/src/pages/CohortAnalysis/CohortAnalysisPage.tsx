import { useEffect, useState, useMemo } from 'react';
import { FilterPanel, FilterSelect } from '../../components/ui/FilterSelect';
import { MarksHistogram } from './MarksHistogram';
import { CorrelationScatter } from './CorrelationScatter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { analyticsService, type Filters } from '../../services/api';

export function CohortAnalysisPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<any>({ regulations: [], subjects: [], batches: [] });
  
  const [loading, setLoading] = useState(false);
  const [perfData, setPerfData] = useState<any>({});
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>({});

  useEffect(() => {
    analyticsService.getFilterOptions({}).then(res => setFilterOptions(res.data)).catch(console.error);
  }, []);

  const fetchData = async () => {
    if (!filters.regulation_id || !filters.subject_id) return;
    setLoading(true);
    try {
      const [perfRes, attRes, compRes] = await Promise.all([
        analyticsService.getPerformance(filters),
        analyticsService.getAttendance(filters),
        analyticsService.getComparisons(filters)
      ]);
      setPerfData(perfRes.data || {});

      const normalizedAttendanceData = Array.isArray(attRes.data)
        ? attRes.data
        : Array.isArray(attRes.data?.data)
          ? attRes.data.data
          : [];
      setAttendanceData(normalizedAttendanceData);

      const normalizedComparisonData =
        compRes.data && typeof compRes.data === 'object'
          ? compRes.data
          : compRes.data?.data && typeof compRes.data.data === 'object'
            ? compRes.data.data
            : {};
      setComparisonData(normalizedComparisonData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const histogram = useMemo(() => {
    if (attendanceData.length === 0) return [];

    const buckets: Record<string, number> = {
      '0-10': 0, '10-20': 0, '20-30': 0, '30-40': 0, '40-50': 0,
      '50-60': 0, '60-70': 0, '70-80': 0, '80-90': 0, '90-100': 0
    };

    attendanceData.forEach((row: any) => {
      const score = Number(row?.weighted_score ?? 0);
      if (!Number.isFinite(score)) return;
      const normalized = Math.max(0, Math.min(100, score));
      const floor = Math.floor(normalized / 10) * 10;
      const start = floor === 100 ? 90 : floor;
      const end = start + 10;
      buckets[`${start}-${end}`] += 1;
    });

    return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
  }, [attendanceData]);

  const scatterPlot = useMemo(() => {
    const avp = comparisonData?.attendance_vs_performance || {};
    const midpointMap: Record<string, number> = {
      '>90%': 95,
      '80-90%': 85,
      '70-80%': 75,
      '<70%': 65
    };

    return Object.entries(avp)
      .map(([bucket, marks]) => ({
        attendance: midpointMap[bucket] ?? 0,
        score: Number(marks ?? 0)
      }))
      .filter((p) => p.attendance > 0 && Number.isFinite(p.score));
  }, [comparisonData]);

  const sectionOrBatchPerformance = useMemo(() => {
    const source = filters.batch_id
      ? (comparisonData?.class_wise || {})
      : (comparisonData?.batch_wise || {});

    return Object.entries(source)
      .map(([key, value]) => ({
        name: filters.batch_id ? String(key) : `Batch ${key}`,
        score: Number(value ?? 0)
      }))
      .filter((row) => Number.isFinite(row.score))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [comparisonData, filters.batch_id]);

  const batchOutcomeEda = useMemo(() => {
    const passByBatch = comparisonData?.batch_pass_percentage || {};
    const attendanceByBatch = comparisonData?.batch_attendance_average || {};
    const keys = Array.from(new Set([...Object.keys(passByBatch), ...Object.keys(attendanceByBatch)]))
      .sort((a, b) => String(a).localeCompare(String(b)));

    return keys.map((batchKey) => ({
      batch: `Batch ${batchKey}`,
      passPercentage: Number(passByBatch[batchKey] ?? 0),
      avgAttendance: Number(attendanceByBatch[batchKey] ?? 0)
    }));
  }, [comparisonData]);

  const avgScore = useMemo(() => {
    const internal = Number(perfData?.internal_score ?? 0);
    const external = Number(perfData?.external_score ?? 0);
    if (internal <= 0 && external <= 0) return 0;
    return (internal + external) / 2;
  }, [perfData]);

  const peakScore = useMemo(() => {
    const compareSource = filters.batch_id ? comparisonData?.class_wise : comparisonData?.batch_wise;
    const values = Object.values(compareSource || {}).map((v: any) => Number(v ?? 0)).filter((v) => Number.isFinite(v));
    return values.length > 0 ? Math.max(...values) : 0;
  }, [comparisonData, filters.batch_id]);

  const failCount = useMemo(() => {
    return attendanceData.filter((row) => Number(row?.weighted_score ?? 0) < 50).length;
  }, [attendanceData]);

  const failPercentage = useMemo(() => {
    if (attendanceData.length === 0) return 0;
    return (failCount / attendanceData.length) * 100;
  }, [attendanceData, failCount]);

  const scopeLabel = filters.batch_id ? `Batch ${filters.batch_id}` : 'All Batches (Overall EDA)';

  return (
    <div className="space-y-8 animate-fade-in">
      <FilterPanel 
        actions={
          <button 
            onClick={fetchData}
            disabled={!filters.regulation_id || !filters.subject_id || loading}
            className="px-6 py-2 bg-gradient-to-br from-primary to-primary-dim text-white rounded-lg font-medium shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Update Analysis'}
          </button>
        }
      >
        <FilterSelect 
          label="Regulation" 
          value={filters.regulation_id || ''} 
          onChange={e => setFilters(f => ({ ...f, regulation_id: e.target.value }))}
          options={filterOptions.regulations?.map((r: any) => ({ value: r.regulation_id, label: r.label })) || []}
        />
        <FilterSelect 
          label="Academic Batch (Optional)" 
          value={filters.batch_id || ''} 
          onChange={e => setFilters(f => ({ ...f, batch_id: e.target.value }))}
          options={filterOptions.batches?.map((b: any) => ({ value: b.batch_id, label: b.batch_id })) || []}
        />
        <FilterSelect 
          label="Subject" widthClass="w-56"
          value={filters.subject_id || ''} 
          onChange={e => setFilters(f => ({ ...f, subject_id: e.target.value }))}
          options={filterOptions.subjects?.map((s: any) => ({ value: s.subject_id, label: s.subject_name })) || []}
        />
      </FilterPanel>

      <div className="bg-surface-container-lowest p-4 rounded-xl">
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Scope</p>
        <p className="text-sm font-semibold text-on-surface">{scopeLabel}</p>
      </div>

      <MarksHistogram 
        distributionData={histogram}
        avgScore={avgScore}
        peakScore={peakScore}
        failPercentage={failPercentage}
        failCount={failCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-full">
            <CorrelationScatter data={scatterPlot} />
        </div>
        <div>
          <section className="bg-surface-container-lowest rounded-xl p-8 h-full">
            <div className="mb-6">
              <h3 className="font-manrope font-extrabold text-2xl text-on-background">
                {filters.batch_id ? 'Section Comparison' : 'Batch Comparison'}
              </h3>
              <p className="text-on-surface-variant text-sm mt-1">
                {filters.batch_id ? 'Section-wise average marks for selected batch.' : 'Batch-wise average marks for selected subject.'}
              </p>
            </div>
            <div className="h-64">
              {sectionOrBatchPerformance.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic h-full flex items-center justify-center">No comparison data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionOrBatchPerformance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#566166' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="score" name="Avg Marks" fill="#0053db" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </div>

      {!filters.batch_id && (
        <section className="bg-surface-container-lowest rounded-xl p-8">
          <div className="mb-6">
            <h3 className="font-manrope font-extrabold text-2xl text-on-background">Batch Outcomes EDA</h3>
            <p className="text-on-surface-variant text-sm mt-1">Pass percentage and average attendance comparison across batches.</p>
          </div>
          <div className="h-72">
            {batchOutcomeEda.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic h-full flex items-center justify-center">No batch outcome data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchOutcomeEda} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
                  <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#566166' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
                  <Bar dataKey="passPercentage" name="Pass %" fill="#0053db" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="avgAttendance" name="Attendance %" fill="#506076" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      )}

      {!filters.batch_id && (
        <section className="bg-surface-container-lowest rounded-xl p-8">
          <div className="mb-6">
            <h3 className="font-manrope font-extrabold text-2xl text-on-background">Section Comparison (All Batches)</h3>
            <p className="text-on-surface-variant text-sm mt-1">All sections across all batches for the selected subject.</p>
          </div>
          <div className="h-72">
            {Object.keys(comparisonData?.class_wise || {}).length === 0 ? (
              <p className="text-sm text-on-surface-variant italic h-full flex items-center justify-center">No section data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(comparisonData.class_wise)
                    .map(([key, value]) => ({ name: String(key), score: Number(value ?? 0) }))
                    .filter((row) => Number.isFinite(row.score))
                    .sort((a, b) => a.name.localeCompare(b.name))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#566166' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="score" name="Avg Marks" fill="#0053db" radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
