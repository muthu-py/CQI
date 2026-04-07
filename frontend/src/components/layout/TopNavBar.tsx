import { useLocation } from 'react-router-dom';

export function TopNavBar() {
  const { pathname } = useLocation();
  const pageTitle = pathname.startsWith('/cohort')
    ? 'Cohort Analysis'
    : pathname.startsWith('/batch')
    ? 'Batch Analysis'
    : pathname.startsWith('/internal-external')
    ? 'Internal vs External Analysis'
    : 'Subject Analysis';

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 bg-slate-50 dark:bg-slate-950 font-manrope antialiased border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{pageTitle}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" style={{ fontSize: '18px' }}>search</span>
          <input className="bg-surface-container-low border-none rounded-full py-1.5 pl-9 pr-4 text-xs w-64 focus:ring-1 focus:ring-primary outline-none text-on-surface" placeholder="Search analytics..." type="text" />
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full relative text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-slate-50"></span>
        </button>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
