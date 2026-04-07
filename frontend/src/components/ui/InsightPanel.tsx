

export type InsightItem = {
  id: string;
  type: 'weakness' | 'strength' | 'alert';
  title: string;
  reason: string;
  action: string;
};

type InsightPanelProps = {
  title?: string;
  subtitle?: string;
  insights: InsightItem[];
};

export function InsightPanel({ title = "Curated Insights", subtitle = "Strategic recommendations based on data trends", insights }: InsightPanelProps) {
  const getTypeStyles = (type: InsightItem['type']) => {
    switch (type) {
      case 'weakness':
        return {
          icon: 'warning',
          iconColor: 'text-error',
          badgeText: 'Weak CO Detected',
          badgeColor: 'text-error',
        };
      case 'strength':
        return {
          icon: 'trending_up',
          iconColor: 'text-primary',
          badgeText: 'Strength Identified',
          badgeColor: 'text-primary',
        };
      case 'alert':
        return {
          icon: 'info',
          iconColor: 'text-secondary',
          badgeText: 'Mapping Alert',
          badgeColor: 'text-secondary',
        };
    }
  };

  return (
    <section className="glass-panel p-8 rounded-2xl border border-white/20 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">lightbulb</span>
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          <p className="text-sm text-on-surface-variant font-medium">{subtitle}</p>
        </div>
      </div>
      
      {insights.length === 0 ? (
        <p className="text-on-surface-variant italic">No insights available for the current scope.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight) => {
            const styles = getTypeStyles(insight.type);
            return (
              <div key={insight.id} className="bg-white/40 p-6 rounded-xl border border-white/40 hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`material-symbols-outlined ${styles.iconColor}`}>{styles.icon}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${styles.badgeColor}`}>
                    {styles.badgeText}
                  </span>
                </div>
                <h4 className="font-bold text-on-surface mb-2">{insight.title}</h4>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  <span className="font-bold block text-xs mb-1">REASON</span>
                  {insight.reason}
                </p>
                <div className="pt-4 border-t border-slate-200/50">
                  <p className="text-sm text-on-surface-variant">
                    <span className="font-bold block text-xs mb-1">IMPROVEMENT</span>
                    {insight.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
