import { memo, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CheckSquare, FolderKanban, Users, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getDashboard,
  getTasks,
  getProjects,
  getUsers,
} from '../services/api.service';
import { Card, StatCard } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { CHART_COLORS, formatDate } from '../lib/utils';
import {
  DASHBOARD_TASKS_LIMIT,
  DASHBOARD_RECENT_TASKS_LIMIT,
  DASHBOARD_BAR_CHART_USERS_LIMIT,
} from '../lib/constants';
import { Badge } from '../components/ui/Badge';
import type { TaskStatus } from '../types';

const STATUS_BADGE: Record<TaskStatus, 'default' | 'info' | 'warning' | 'success'> = {
  todo: 'default',
  in_progress: 'info',
  review: 'warning',
  done: 'success',
};

export const DashboardPage = memo(() => {
  const { t } = useTranslation();

  const [summaryQuery, tasksQuery, projectsQuery, usersQuery] = useQueries({
    queries: [
      { queryKey: ['dashboard'], queryFn: getDashboard },
      { queryKey: ['tasks'], queryFn: () => getTasks({ limit: DASHBOARD_TASKS_LIMIT }) },
      { queryKey: ['projects'], queryFn: getProjects },
      { queryKey: ['users'], queryFn: getUsers },
    ],
  });

  const isLoading = summaryQuery.isLoading;
  const summary = summaryQuery.data;
  const tasks = tasksQuery.data;
  const projects = projectsQuery.data;
  const users = usersQuery.data;

  const totalTasks = useMemo(
    () => summary?.byStatus.reduce((sum, s) => sum + s.count, 0) ?? 0,
    [summary]
  );

  const doneTasks = useMemo(
    () => summary?.byStatus.find((s) => s.status === 'done')?.count ?? 0,
    [summary]
  );

  const pieData = useMemo(
    () =>
      summary?.byStatus.map((s) => ({
        name: t(`status.${s.status}`),
        value: s.count,
      })) ?? [],
    [summary, t]
  );

  const barData = useMemo(
    () =>
      summary?.byUser.slice(0, DASHBOARD_BAR_CHART_USERS_LIMIT).map((u) => ({
        name: u.user_name.split(' ')[0],
        tasks: u.count,
      })) ?? [],
    [summary]
  );

  const recentTasks = useMemo(
    () => tasks?.slice(0, DASHBOARD_RECENT_TASKS_LIMIT) ?? [],
    [tasks]
  );

  const completionPercentage = useMemo(
    () => (totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0),
    [doneTasks, totalTasks]
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('dashboard.totalTasks')}
          value={totalTasks}
          icon={<CheckSquare className="h-6 w-6" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title={t('dashboard.completed')}
          value={doneTasks}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-green-50 text-green-600"
          subtitle={
            totalTasks ? t('dashboard.completedPct', { pct: completionPercentage }) : undefined
          }
        />
        <StatCard
          title={t('dashboard.projects')}
          value={projects?.length ?? 0}
          icon={<FolderKanban className="h-6 w-6" />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title={t('dashboard.teamMembers')}
          value={users?.length ?? 0}
          icon={<Users className="h-6 w-6" />}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            {t('dashboard.tasksByStatus')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            {t('dashboard.tasksByMember')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            {t('dashboard.recentTasks')}
          </h2>
          <div className="space-y-3">
            {recentTasks.length === 0 && (
              <p className="text-sm text-slate-400">{t('dashboard.noTasksYet')}</p>
            )}
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(task.dueDate)}</p>
                </div>
                <Badge variant={STATUS_BADGE[task.status]}>
                  {t(`status.${task.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            {t('dashboard.tasksByProject')}
          </h2>
          <div className="space-y-3">
            {(summary?.byProject ?? []).length === 0 && (
              <p className="text-sm text-slate-400">{t('dashboard.noProjectsYet')}</p>
            )}
            {summary?.byProject.map((p) => {
              const pct = totalTasks ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.project_id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 truncate">{p.project_name}</span>
                    <span className="text-slate-500 ml-2 shrink-0">{p.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';
