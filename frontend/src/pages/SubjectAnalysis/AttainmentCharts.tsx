import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export type CoData = {
  co: string;
  attainment: number;
};

export type PoData = {
  po: string;
  name: string;
  attainment: number;
};

type AttainmentChartsProps = {
  coData: CoData[];
  poData: PoData[];
  avgCoAttainment: number;
};

export function AttainmentCharts({ coData, poData, avgCoAttainment }: AttainmentChartsProps) {
  const avgPoAttainment = poData.length > 0
    ? poData.reduce((acc, curr) => acc + curr.attainment, 0) / poData.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* CO Attainment Chart */}
      <div className="bg-surface-container-lowest p-6 rounded-xl relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-bold">CO-wise Attainment</h3>
            <p className="text-xs text-on-surface-variant">Percentage of targets achieved per Course Outcome</p>
          </div>
          <span className="text-2xl font-black text-primary">
            {avgCoAttainment.toFixed(1)}% <span className="text-[10px] text-on-surface-variant font-medium">AVG</span>
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="co" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#566166', fontWeight: 700 }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: any) => [`${val}%`, 'Attainment']} 
              />
              <Bar dataKey="attainment" radius={[8, 8, 0, 0]} background={{ fill: '#f0f4f7' }}>
                {
                  coData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attainment < 50 ? '#9f403d' : '#0053db'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PO Attainment Chart */}
      <div className="bg-surface-container-lowest p-6 rounded-xl relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-bold">PO-wise Attainment</h3>
            <p className="text-xs text-on-surface-variant">Percentage of targets achieved per Program Outcome</p>
          </div>
          {poData.length > 0 && (
            <span className="text-2xl font-black text-primary">
              {avgPoAttainment.toFixed(1)}% <span className="text-[10px] text-on-surface-variant font-medium">AVG</span>
            </span>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={poData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="po" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#566166', fontWeight: 700 }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Attainment']} 
              />
              <Bar dataKey="attainment" radius={[8, 8, 0, 0]} background={{ fill: '#f0f4f7' }}>
                {
                  poData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attainment < 50 ? '#9f403d' : '#0053db'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
