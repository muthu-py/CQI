
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { MetricCard } from '../../components/ui/MetricCard';

type MarksHistogramProps = {
  distributionData: Array<{ bucket: string; count: number }>;
  avgScore: number;
  peakScore: number;
  failPercentage: number;
  failCount: number;
};

export function MarksHistogram({
  distributionData, avgScore, peakScore, failPercentage, failCount
}: MarksHistogramProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="font-manrope font-bold text-xl text-on-surface">Marks Distribution</h3>
            <p className="text-xs text-on-surface-variant">Frequency density of academic performance across cohort.</p>
          </div>
          <button className="text-primary hover:bg-primary-container p-2 rounded-lg transition-colors">
            <span className="material-symbols-outlined">open_in_full</span>
          </button>
        </div>
        
        {/* Visual Histogram with Recharts */}
        <div className="h-64">
           {distributionData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-on-surface-variant italic text-sm">No data available. Try adjusting filters.</div>
           ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                     <XAxis dataKey="bucket" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#566166' }} axisLine={false} tickLine={false} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(0, 83, 219, 0.1)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                     />
                     <Bar dataKey="count" fill="#0053db" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
           )}
        </div>
      </div>
      
      {/* Metrics Sidebar */}
      <div className="flex flex-col gap-4">
         <MetricCard 
            label="Average Score" 
            value={avgScore.toFixed(1)} 
            subValue={<span className="text-sm font-bold text-green-600">+4.2%</span>} 
            isActive={true} 
         />
         <MetricCard 
            label="Peak Performance" 
            value={peakScore} 
            subValue="/ 100" 
         />
         <MetricCard 
            label="Critical Failures" 
            value={`${failPercentage.toFixed(1)}%`} 
            valueColorClass="text-error"
            subValue={`${failCount} students`} 
         />
      </div>
    </div>
  );
}
