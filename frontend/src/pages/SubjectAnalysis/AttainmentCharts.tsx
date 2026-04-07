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
      <div className="bg-surface-container-lowest p-6 rounded-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-bold">PO-wise Attainment</h3>
            <p className="text-xs text-on-surface-variant">Direct attainment mapped to Program Outcomes</p>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center text-[10px] font-bold text-primary">DS</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-[10px] font-bold text-primary">AC</div>
          </div>
        </div>
        <div className="space-y-5">
          {poData.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">No PO data available.</p>
          ) : (
            poData.map((item) => (
              <div key={item.po}>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>{item.po}: {item.name}</span>
                  <span className="text-primary">{item.attainment.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${item.attainment}%` }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
