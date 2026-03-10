import { Outlet, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { useRealtimeSync } from "../../lib/realtime";
import { useAuthStore } from "../../store/auth.store";
import { getMe } from "../../services/api.service";
import { PageSpinner } from "../ui/Spinner";

export function AppLayout() {
  const { token, setAuth, user } = useAuthStore();
  useRealtimeSync(token && user ? token : null);

  const { isLoading } = useQuery({
    queryKey: ["me"],
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
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--bg-app)" }}
      >
        <PageSpinner />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-app)" }}
    >
      <Sidebar />
      <main className="h-screen flex-1 overflow-y-auto">
        <div className="w-full p-4 sm:p-6 lg:p-8 xl:p-10 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
