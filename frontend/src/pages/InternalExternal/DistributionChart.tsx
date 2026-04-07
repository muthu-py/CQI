import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { InternalExternalRecord } from '../../services/api';

type Props = { data: InternalExternalRecord[] };

/**
 * Builds a percentage-frequency histogram from a list of values.
 * Buckets: 0–10, 10–20, …, 90–100
 */
function buildHistogram(values: number[]): { bucket: string; count: number }[] {
  const buckets: Record<string, number> = {
    '0–10': 0, '10–20': 0, '20–30': 0, '30–40': 0, '40–50': 0,
    '50–60': 0, '60–70': 0, '70–80': 0, '80–90': 0, '90–100': 0,
  };
  values.forEach(v => {
    const n = Math.max(0, Math.min(100, v));
    const floor = Math.floor(n / 10) * 10;
    const start = floor === 100 ? 90 : floor;
    const key = `${start}–${start + 10}`;
    if (key in buckets) buckets[key]++;
  });
  return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
}

export function DistributionChart({ data }: Props) {
  const internalValues = data
    .map(d => d.internal_percentage)
    .filter((v): v is number => v !== null);

  const externalValues = data
    .map(d => d.external_percentage)
    .filter((v): v is number => v !== null);

  const internalHist = buildHistogram(internalValues);
  const externalHist = buildHistogram(externalValues);

  // Merge into one array keyed by bucket
  const merged = internalHist.map((entry, i) => ({
    bucket: entry.bucket,
    Internal: entry.count,
    External: externalHist[i]?.count ?? 0,
  })).filter(e => e.Internal > 0 || e.External > 0);

  return (
    <div className="min-w-0 bg-surface-container-lowest p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="font-manrope font-bold text-lg text-on-surface">
          Distribution Comparison
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Overlaid frequency of Internal and External % across score buckets
        </p>
      </div>
      <div className="min-w-0 h-72">
        {merged.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-on-surface-variant italic">
            No distribution data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={merged}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
              <XAxis
                dataKey="bucket"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#566166', fontWeight: 700 }}
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(0,83,219,0.05)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(val: any, key: any) => [`${val} student${val !== 1 ? 's' : ''}`, key]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }}
              />
              <Bar dataKey="Internal" name="Internal %" fill="#0053db" radius={[4, 4, 0, 0]} barSize={14} fillOpacity={0.85} />
              <Bar dataKey="External" name="External %" fill="#506076" radius={[4, 4, 0, 0]} barSize={14} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
