import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

import { getMe } from '@/api/auth';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, setLogin } = useAuthStore();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (user) {
      setLogin('', user);
    }
  }, [user, setLogin]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
}
