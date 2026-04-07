
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type CorrelationScatterProps = {
  data: Array<{ attendance: number; score: number }>;
};

export function CorrelationScatter({ data }: CorrelationScatterProps) {
  return (
    <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 relative h-full">
      <h3 className="font-manrope font-bold text-lg mb-2">Correlation Analysis</h3>
      <p className="text-xs text-on-surface-variant mb-6 italic">Attendance Rate vs Assessment Scores</p>
      
      <div className="h-56 relative bg-surface-container-lowest rounded-lg overflow-hidden flex items-center justify-center p-2">
         {data.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">Select a scope to view correlation.</p>
         ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9e4ea" />
                <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="score" name="Score" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Students" data={data} fill="#0053db" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
         )}
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-bold text-on-surface-variant px-1 uppercase tracking-widest">
        <span>0% Attendance</span>
        <span>100% Attendance</span>
      </div>
    </section>
  );
}
