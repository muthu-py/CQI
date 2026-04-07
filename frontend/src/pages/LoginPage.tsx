import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getToken, login } from '../services/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const token = getToken();

  useEffect(() => {
    document.title = 'Admin Login | CQI Portfolio';
  }, []);

  if (token) {
    return <Navigate to="/subject" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/subject', { replace: true });
    } catch (submitError) {
      setError('Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] sm:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">CQI Admin</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to the analytics dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
