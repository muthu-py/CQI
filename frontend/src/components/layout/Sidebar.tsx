import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 p-4 gap-4 bg-slate-100 dark:bg-slate-900 w-64 border-r-0 font-manrope text-sm font-medium">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-lg">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">CQI Portfolio</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70 mt-1">Intellectual Atelier</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <NavLink 
          to="/subject" 
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-transform duration-200 group hover:translate-x-1 ${isActive ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined text-xl">analytics</span>
          <span>Subject Analysis</span>
        </NavLink>
        <NavLink 
          to="/cohort" 
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-transform duration-200 group hover:translate-x-1 ${isActive ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined text-xl">group</span>
          <span>Cohort Analysis</span>
        </NavLink>
        <NavLink 
          to="/batch" 
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-transform duration-200 group hover:translate-x-1 ${isActive ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined text-xl">table_chart</span>
          <span>Batch Analysis</span>
        </NavLink>
        <NavLink 
          to="/internal-external" 
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-transform duration-200 group hover:translate-x-1 ${isActive ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined text-xl">compare_arrows</span>
          <span>Internal vs External</span>
        </NavLink>
      </nav>
      <div className="mt-auto space-y-1 border-t border-outline-variant/10 pt-4">
        <button className="w-full mb-4 bg-primary text-on-primary py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-transform flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">download</span>
          Download Report
        </button>
        <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined text-xl">settings</span>
          <span>Settings</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all rounded-lg" href="#">
          <span className="material-symbols-outlined text-xl">help</span>
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
}
