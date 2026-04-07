import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { InternalExternalRecord } from '../../services/api';

type Props = { data: InternalExternalRecord[] };

const truncate = (name: string, max = 10) =>
  name.length > max ? `${name.slice(0, max)}…` : name;

export function ComparisonBarChart({ data }: Props) {
  const chartData = data.map(d => ({
    name: truncate(d.student_name),
    fullName: d.student_name,
    Internal: d.internal_percentage,
    External: d.external_percentage,
  }));

  // Use a pixel width for scroll when many students, else fill container
  const chartWidth = data.length > 15 ? data.length * 60 : '100%';

  return (
    <div className="min-w-0 bg-surface-container-lowest p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="font-manrope font-bold text-lg text-on-surface">Student Comparison</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Per-student grouped bar — Internal vs External percentage
        </p>
      </div>
      <div className="min-w-0 h-72" style={{ overflowX: data.length > 15 ? 'auto' : 'hidden' }}>
        <ResponsiveContainer width={chartWidth} height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#566166' }}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: 'rgba(0,83,219,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(val: any, _key: any, entry: any) => [
                `${Number(val).toFixed(1)}%`,
                entry.name,
              ]}
              labelFormatter={(_label: any, payload: any) => payload?.[0]?.payload?.fullName ?? _label}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }}
            />
            <Bar dataKey="Internal" name="Internal %" fill="#0053db" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="External" name="External %" fill="#506076" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
