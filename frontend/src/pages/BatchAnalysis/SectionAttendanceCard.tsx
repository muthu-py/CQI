import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

const SECTION_COLORS: Record<string, { border: string; badge: string; bar: string; bg: string; warnBar: string }> = {
  A: { border: 'border-blue-500',    badge: 'bg-blue-500',    bar: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/20',    warnBar: '#ef4444' },
  B: { border: 'border-emerald-500', badge: 'bg-emerald-500', bar: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/20', warnBar: '#ef4444' },
  C: { border: 'border-amber-500',   badge: 'bg-amber-500',   bar: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/20',  warnBar: '#ef4444' },
};

const DEFAULT_COLOR = { border: 'border-slate-400', badge: 'bg-slate-400', bar: '#64748b', bg: 'bg-slate-50 dark:bg-slate-900/20', warnBar: '#ef4444' };

export interface SectionAttendanceData {
  student_count: number;
  avg_attendance: number;
  below_75_count: number;
  below_60_count: number;
  below_75_percentage: number;
  distribution: Record<string, number>;
  students: Array<{ student_id: string; weighted_score: number }>;
}

interface Props {
  batchId: string | number;
  sectionName: string;
  data: SectionAttendanceData;
}

export function SectionAttendanceCard({ batchId, sectionName, data }: Props) {
  const colors = SECTION_COLORS[sectionName] ?? DEFAULT_COLOR;

  const distributionData = useMemo(() => {
    return Object.entries(data.distribution).map(([bucket, count]) => ({ bucket, count }));
  }, [data.distribution]);

  const above75Count = data.student_count - data.below_75_count;

  // Attendance status color
  const avgColor =
    data.avg_attendance >= 75
      ? 'text-emerald-600 dark:text-emerald-400'
      : data.avg_attendance >= 60
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

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
          <p className={`text-2xl font-black ${avgColor}`}>{data.avg_attendance.toFixed(1)}%</p>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Avg Attendance</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 divide-x divide-outline/10 border-b border-outline/10">
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-emerald-600">{above75Count}</p>
          <p className="text-[10px] text-on-surface-variant">≥ 75%</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-red-500">{data.below_75_count}</p>
          <p className="text-[10px] text-on-surface-variant">&lt; 75%</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-red-700">{data.below_60_count}</p>
          <p className="text-[10px] text-on-surface-variant">&lt; 60%</p>
        </div>
      </div>

      {/* At-risk progress bar */}
      <div className="px-5 py-3 border-b border-outline/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">At Risk (&lt;75%)</span>
          <span className="text-[10px] font-bold text-red-500">{data.below_75_percentage.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-red-400 transition-all duration-500"
            style={{ width: `${Math.min(data.below_75_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Distribution chart */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-3">
          Attendance Distribution
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
                {/* 75% threshold reference line */}
                <ReferenceLine x="70-80" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '75%', fill: '#ef4444', fontSize: 9 }} />
                <Bar dataKey="count" name="Students" fill={colors.bar} radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
