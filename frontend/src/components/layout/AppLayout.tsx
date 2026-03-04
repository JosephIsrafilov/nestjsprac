import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '../../services/api.service';
import { PageSpinner } from '../ui/Spinner';

export function AppLayout() {
  const { token, setAuth, user } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await getMe();
      setAuth(data, token!);
      return data;
    },
    enabled: !!token && !user,
    retry: false,
  });

  if (!token) return <Navigate to="/login" replace />;
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-sky-500/18 blur-3xl" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      <Sidebar />

      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
