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
  if (isLoading) return <div className="flex h-screen items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
