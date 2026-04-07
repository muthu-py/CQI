import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Section A=blue, B=green/emerald, C=amber
const SECTION_COLORS: Record<string, { border: string; badge: string; bar: string; bg: string }> = {
  A: { border: 'border-blue-500',   badge: 'bg-blue-500',    bar: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  B: { border: 'border-emerald-500', badge: 'bg-emerald-500', bar: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  C: { border: 'border-amber-500',  badge: 'bg-amber-500',   bar: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/20' },
};

const DEFAULT_COLOR = { border: 'border-slate-400', badge: 'bg-slate-400', bar: '#64748b', bg: 'bg-slate-50 dark:bg-slate-900/20' };

export interface SectionMarksData {
  student_count: number;
  avg_percentage: number;
  pass_count: number;
  pass_percentage: number;
  distribution: Record<string, number>;
  students: Array<{ student_id: string; percentage: number }>;
}

interface Props {
  batchId: string | number;
  sectionName: string;
  data: SectionMarksData;
}

export function SectionMarksCard({ batchId, sectionName, data }: Props) {
  const colors = SECTION_COLORS[sectionName] ?? DEFAULT_COLOR;

  const distributionData = useMemo(() => {
    return Object.entries(data.distribution).map(([bucket, count]) => ({ bucket, count }));
  }, [data.distribution]);

  const failCount = data.student_count - data.pass_count;

  return (
    <div className={`rounded-2xl border-l-4 ${colors.border} bg-surface-container-lowest shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between ${colors.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${colors.badge} flex items-center justify-center text-white font-black text-sm shadow`}>
            {sectionName}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Batch {batchId} · Section {sectionName}
            </p>
            <p className="text-sm font-bold text-on-surface">{data.student_count} Students</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-on-surface">{data.avg_percentage.toFixed(1)}%</p>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Avg Marks</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 divide-x divide-outline/10 border-b border-outline/10">
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-on-surface">{data.pass_count}</p>
          <p className="text-[10px] text-on-surface-variant">Passed</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-red-500">{failCount}</p>
          <p className="text-[10px] text-on-surface-variant">Failed</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-on-surface">{data.pass_percentage.toFixed(1)}%</p>
          <p className="text-[10px] text-on-surface-variant">Pass Rate</p>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-3">
          Marks Distribution
        </p>
        <div className="h-36">
          {distributionData.every(d => d.count === 0) ? (
            <p className="text-xs text-on-surface-variant italic flex items-center justify-center h-full">
              No data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="bucket"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 8, fontWeight: 'bold', fill: '#94a3b8' }}
                  interval={1}
                />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  formatter={(v: any) => [`${v} students`, 'Count']}
                />
                <Bar dataKey="count" name="Students" fill={colors.bar} radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
