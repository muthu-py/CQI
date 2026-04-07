import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signout } from '../../services/auth';

export function TopNavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const pageTitle = (() => {
    if (pathname.startsWith('/cohort')) return 'Cohort Analysis';
    if (pathname.startsWith('/batch')) return 'Batch Analysis';
    if (pathname.startsWith('/teacher')) return 'Teacher Analysis';
    return 'Subject Analysis';
  })();

  async function handleSignout() {
    try {
      await signout();
    } finally {
      setMenuOpen(false);
      navigate('/login', { replace: true });
    }
  }

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
        <div className="relative">
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full text-on-surface-variant hover:text-on-surface"
            aria-label="Account menu"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
              <button
                onClick={handleSignout}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
