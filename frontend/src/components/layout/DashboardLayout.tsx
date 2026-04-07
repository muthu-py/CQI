import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface text-on-surface antialiased">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopNavBar />
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
