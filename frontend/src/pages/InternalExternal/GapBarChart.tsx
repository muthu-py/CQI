import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { InternalExternalRecord } from '../../services/api';

type Props = { data: InternalExternalRecord[] };

const truncate = (name: string, max = 10) =>
  name.length > max ? `${name.slice(0, max)}…` : name;

export function GapBarChart({ data }: Props) {
  const chartData = data
    .filter(d => d.gap !== null)
    .map(d => ({
      name: truncate(d.student_name),
      fullName: d.student_name,
      gap: Number((d.gap as number).toFixed(2)),
    }));

  const chartWidth = chartData.length > 15 ? chartData.length * 52 : '100%';

  return (
    <div className="min-w-0 bg-surface-container-lowest p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="font-manrope font-bold text-lg text-on-surface">Gap Analysis</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Internal&nbsp;%&nbsp;–&nbsp;External&nbsp;% per student.{' '}
          <span className="text-error font-semibold">Red</span> = internal higher;{' '}
          <span className="font-semibold" style={{ color: '#0053db' }}>Blue</span> = external higher.
        </p>
      </div>
      <div className="min-w-0 h-72" style={{ overflowX: chartData.length > 15 ? 'auto' : 'hidden' }}>
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
            No gap data available (requires both internal and external marks).
          </div>
        ) : (
          <ResponsiveContainer width={chartWidth} height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#566166' }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Gap']}
                labelFormatter={(_label: any, payload: any) => payload?.[0]?.payload?.fullName ?? _label}
              />
              <Bar dataKey="gap" name="Gap (Internal – External)" radius={[4, 4, 0, 0]} barSize={18}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`gap-cell-${index}`}
                    fill={entry.gap >= 0 ? '#9f403d' : '#0053db'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
