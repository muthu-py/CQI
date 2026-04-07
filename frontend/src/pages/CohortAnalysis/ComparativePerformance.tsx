
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

type ComparativePerformanceProps = {
  data: Array<{
    assessment: string;
    sectionA: number;
    sectionB: number;
    sectionC: number;
  }>;
  title?: string;
  subtitle?: string;
  sectionLabels?: {
    sectionA: string;
    sectionB: string;
    sectionC: string;
  };
};

export function ComparativePerformance({
  data,
  title = 'Comparative Performance',
  subtitle = 'Inter-sectional performance metrics across Batches A, B, and C.',
  sectionLabels = {
    sectionA: 'Section A',
    sectionB: 'Section B',
    sectionC: 'Section C'
  }
}: ComparativePerformanceProps) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h3 className="font-manrope font-extrabold text-2xl text-on-background">{title}</h3>
          <p className="text-on-surface-variant text-sm mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="h-64">
         {data.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic h-full flex items-center justify-center">No comparative data available.</p>
         ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ee" />
                <XAxis dataKey="assessment" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#566166' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#566166' }} />
                <Bar dataKey="sectionA" name={sectionLabels.sectionA} fill="#0053db" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="sectionB" name={sectionLabels.sectionB} fill="#506076" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="sectionC" name={sectionLabels.sectionC} fill="#a9b4b9" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
         )}
      </div>
    </section>
  );
}
