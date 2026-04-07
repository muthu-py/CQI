import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearToken, getMe, getToken } from '../../services/auth';

export function RequireAuth() {
  const location = useLocation();
  const token = getToken();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function validateToken() {
      if (!token) {
        if (mounted) {
          setIsValid(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        await getMe();
        if (mounted) {
          setIsValid(true);
        }
      } catch (_error) {
        clearToken();
        if (mounted) {
          setIsValid(false);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    }

    void validateToken();

    return () => {
      mounted = false;
    };
  }, [token]);

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Checking session...</div>;
  }

  if (!token || !isValid) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
