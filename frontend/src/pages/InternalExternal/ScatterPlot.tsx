import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { InternalExternalRecord } from '../../services/api';

type Props = { data: InternalExternalRecord[] };

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-surface-container-lowest rounded-xl p-3 shadow-lg text-xs font-medium space-y-1 border border-outline-variant/10">
      <p className="font-bold text-on-surface">{d.name}</p>
      <p className="text-on-surface-variant">
        Internal: <span className="text-primary font-bold">{Number(d.x ?? 0).toFixed(1)}%</span>
      </p>
      <p className="text-on-surface-variant">
        External: <span className="text-primary font-bold">{Number(d.y ?? 0).toFixed(1)}%</span>
      </p>
    </div>
  );
}

export function ScatterPlot({ data }: Props) {
  const points = data
    .filter(d => d.internal_percentage !== null && d.external_percentage !== null)
    .map(d => ({
      x: d.internal_percentage as number,
      y: d.external_percentage as number,
      name: d.student_name,
    }));

  return (
    <div className="min-w-0 bg-surface-container-lowest p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="font-manrope font-bold text-lg text-on-surface">Correlation Scatter</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Internal % (X) vs External % (Y) — each dot is one student
        </p>
      </div>
      <div className="min-w-0 h-72">
        {points.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
            No data with both internal and external marks.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e9ee" />
              <XAxis
                type="number"
                dataKey="x"
                name="Internal %"
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                label={{ value: 'Internal %', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#566166' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="External %"
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                label={{ value: 'External %', angle: -90, position: 'insideLeft', offset: 12, fontSize: 10, fill: '#566166' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={points} fill="#0053db" fillOpacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
