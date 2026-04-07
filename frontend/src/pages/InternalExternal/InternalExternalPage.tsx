import { useEffect, useState } from 'react';
import { FilterPanel, FilterSelect } from '../../components/ui/FilterSelect';
import { analyticsService, type Filters, type InternalExternalRecord } from '../../services/api';
import { ComparisonBarChart } from './ComparisonBarChart';
import { ScatterPlot } from './ScatterPlot';
import { GapBarChart } from './GapBarChart';
import { DistributionChart } from './DistributionChart';

// ─── Types ──────────────────────────────────────────────────────────────────

type Summary = {
  total_students: number;
  avg_internal: number | null;
  avg_external: number | null;
  avg_gap: number | null;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildSummaryFromRows = (rows: InternalExternalRecord[]): Summary | null => {
  if (!rows.length) return null;

  const avg = (values: Array<number | null>) => {
    const numeric = values.filter((value): value is number => value !== null);
    if (!numeric.length) return null;
    const total = numeric.reduce((sum, value) => sum + value, 0);
    return Math.round((total / numeric.length) * 100) / 100;
  };

  return {
    total_students: rows.length,
    avg_internal: avg(rows.map((row) => row.internal_percentage)),
    avg_external: avg(rows.map((row) => row.external_percentage)),
    avg_gap: avg(rows.map((row) => row.gap)),
  };
};

const clampPercentage = (value: number | null): number | null => {
  if (value === null) return null;
  return Math.max(0, Math.min(100, value));
};

const normalizeSummary = (
  rawSummary: any,
  rows: InternalExternalRecord[],
  rawBody: any
): Summary | null => {
  const candidate = rawSummary && typeof rawSummary === 'object'
    ? rawSummary
    : rawBody && typeof rawBody === 'object'
    ? rawBody
    : null;

  const normalized = candidate
    ? {
        total_students:
          toNullableNumber(candidate.total_students ?? candidate.totalStudents) ?? rows.length,
        avg_internal: clampPercentage(
          toNullableNumber(candidate.avg_internal ?? candidate.avgInternal)
        ),
        avg_external: clampPercentage(
          toNullableNumber(candidate.avg_external ?? candidate.avgExternal)
        ),
        avg_gap: toNullableNumber(candidate.avg_gap ?? candidate.avgGap),
      }
    : null;

  const computed = buildSummaryFromRows(rows);

  if (normalized) {
    return {
      total_students: normalized.total_students ?? computed?.total_students ?? rows.length,
      avg_internal: normalized.avg_internal ?? computed?.avg_internal ?? null,
      avg_external: normalized.avg_external ?? computed?.avg_external ?? null,
      avg_gap: normalized.avg_gap ?? computed?.avg_gap ?? null,
    };
  }

  return computed;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function InternalExternalPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<any>({
    regulations: [],
    subjects: [],
    batches: [],
  });

  const [data, setData] = useState<InternalExternalRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    analyticsService.getFilterOptions({}).then(res => setFilterOptions(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setData([]);
    setSummary(null);
    setError(null);
    setFetched(false);
  }, [filters.regulation_id, filters.subject_id, filters.batch_id]);

  const canFetch =
    !!filters.regulation_id && !!filters.subject_id && !!filters.batch_id;

  const fetchData = async () => {
    if (!canFetch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getInternalExternal(filters);
      const body = res.data ?? {};
      const rawStudents = Array.isArray(body.students) ? body.students : (Array.isArray(body) ? body : []);

      // pg returns numeric as strings — coerce once on arrival
      const rows: InternalExternalRecord[] = rawStudents.map((r: any) => ({
        student_id: Number(r.student_id),
        student_name: r.student_name ?? `Student #${r.student_id}`,
        internal_percentage: clampPercentage(
          r.internal_percentage != null ? Number(r.internal_percentage) : null
        ),
        external_percentage: clampPercentage(
          r.external_percentage != null ? Number(r.external_percentage) : null
        ),
        gap: r.gap != null ? Number(r.gap) : null,
      }));

      setData(rows);
      setSummary(normalizeSummary(body.summary, rows, body));
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to fetch data. Please try again.');
      setData([]);
      setSummary(null);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  // ─── Summary metrics — use server-computed values ─────────────────────────
  const avgInternal = summary?.avg_internal ?? null;
  const avgExternal = summary?.avg_external ?? null;
  const avgGap = summary?.avg_gap ?? null;

  const gapSign = avgGap !== null && avgGap >= 0 ? '+' : '';
  const gapColor = avgGap !== null && avgGap > 2
    ? 'text-error'
    : avgGap !== null && avgGap < -2
    ? 'text-primary'
    : 'text-on-surface';

  const formatPercent = (value: number | null) =>
    value !== null ? `${value.toFixed(1)}%` : '—';

  const scopeLabel = [
    filters.batch_id ? `Batch ${filters.batch_id}` : null,
    filters.subject_id ? `Subject ${filters.subject_id}` : null,
  ]
    .filter(Boolean)
    .join(' · ') || 'Select filters above';

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <FilterPanel
        actions={
          <button
            id="ie-fetch-btn"
            onClick={fetchData}
            disabled={!canFetch || loading}
            className="px-6 py-2 bg-gradient-to-br from-primary to-primary-dim text-white rounded-lg font-medium shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Loading...' : 'Run Analysis'}
          </button>
        }
      >
        <FilterSelect
          label="Regulation"
          value={filters.regulation_id || ''}
          onChange={e => setFilters(f => ({ ...f, regulation_id: e.target.value }))}
          options={
            filterOptions.regulations?.map((r: any) => ({
              value: r.regulation_id,
              label: r.label,
            })) || []
          }
        />
        <FilterSelect
          label="Batch"
          value={filters.batch_id || ''}
          onChange={e => setFilters(f => ({ ...f, batch_id: e.target.value }))}
          options={
            filterOptions.batches?.map((b: any) => ({
              value: b.batch_id,
              label: b.batch_id,
            })) || []
          }
        />
        <FilterSelect
          label="Subject"
          widthClass="w-56"
          value={filters.subject_id || ''}
          onChange={e => setFilters(f => ({ ...f, subject_id: e.target.value }))}
          options={
            filterOptions.subjects?.map((s: any) => ({
              value: s.subject_id,
              label: s.subject_name,
            })) || []
          }
        />
      </FilterPanel>

      {/* ── Error state ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-error-container/30 border border-error/20 text-error rounded-xl p-4 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* ── Summary Metric Cards ────────────────────────────────────────── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Scope */}
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            Scope
          </p>
          <p className="text-sm font-semibold text-on-surface">{scopeLabel}</p>
        </div>
        {/* Avg Internal */}
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            Avg Internal
          </p>
          <p className="text-2xl font-black text-primary">
            {data.length > 0 ? formatPercent(avgInternal) : '—'}
          </p>
        </div>
        {/* Avg External */}
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            Avg External
          </p>
          <p className="text-2xl font-black text-primary">
            {data.length > 0 ? formatPercent(avgExternal) : '—'}
          </p>
        </div>
        {/* Avg Gap */}
        <div className="bg-surface-container-lowest p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            Avg Gap (Int – Ext)
          </p>
          <p className={`text-2xl font-black ${gapColor}`}>
            {data.length > 0 && avgGap !== null ? `${gapSign}${avgGap.toFixed(1)}%` : '—'}
          </p>
        </div>
      </section>

      {/* ── Pre-fetch / Loading / No-data states ───────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-on-surface-variant gap-3">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span className="text-sm font-medium">Computing analytics…</span>
        </div>
      )}

      {!loading && fetched && data.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl">inbox</span>
          <p className="text-sm font-medium">No data found for the selected filters.</p>
          <p className="text-xs">Try a different Batch, Subject, or Regulation combination.</p>
        </div>
      )}

      {!loading && !fetched && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl">compare_arrows</span>
          <p className="text-sm font-medium">Select Regulation, Batch, and Subject then click Run Analysis.</p>
        </div>
      )}

      {/* ── Charts — only when we have data ────────────────────────────── */}
      {!loading && data.length > 0 && (
        <>
          {/* Row 1: Grouped bar + Scatter */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ComparisonBarChart data={data} />
            <ScatterPlot data={data} />
          </div>

          {/* Row 2: Gap + Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <GapBarChart data={data} />
            <DistributionChart data={data} />
          </div>

          {/* Row 3: Detail table (top / bottom students by gap) */}
          <section className="bg-surface-container-lowest rounded-xl p-6">
            <div className="mb-4">
              <h3 className="font-manrope font-bold text-lg text-on-surface">
                Student Detail Table
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                All students sorted by gap (largest first). Null = no marks recorded for that component.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left text-[10px] uppercase tracking-wider text-on-surface-variant font-bold pb-3 pr-4">
                      Student
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-wider text-on-surface-variant font-bold pb-3 pr-4">
                      Internal %
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-wider text-on-surface-variant font-bold pb-3 pr-4">
                      External %
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-wider text-on-surface-variant font-bold pb-3">
                      Gap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...data]
                    .sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0))
                    .map(row => {
                      const gapVal = row.gap;
                      const gapCls =
                        gapVal === null
                          ? 'text-on-surface-variant'
                          : gapVal > 2
                          ? 'text-error font-bold'
                          : gapVal < -2
                          ? 'text-primary font-bold'
                          : 'text-on-surface';
                      return (
                        <tr
                          key={row.student_id}
                          className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container/50 transition-colors"
                        >
                          <td className="py-3 pr-4 font-medium text-on-surface">
                            {row.student_name}
                          </td>
                          <td className="py-3 pr-4 text-right text-on-surface-variant">
                            {row.internal_percentage !== null
                              ? `${row.internal_percentage.toFixed(1)}%`
                              : <span className="italic text-xs">—</span>}
                          </td>
                          <td className="py-3 pr-4 text-right text-on-surface-variant">
                            {row.external_percentage !== null
                              ? `${row.external_percentage.toFixed(1)}%`
                              : <span className="italic text-xs">—</span>}
                          </td>
                          <td className={`py-3 text-right ${gapCls}`}>
                            {gapVal !== null
                              ? `${gapVal >= 0 ? '+' : ''}${gapVal.toFixed(1)}%`
                              : <span className="italic text-xs text-on-surface-variant">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
