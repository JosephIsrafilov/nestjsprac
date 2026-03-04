import { memo, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
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
} from "recharts";
import { CheckSquare, FolderKanban, Users, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDashboard, getTasks, getProjects, getUsers } from "../services/api.service";
import { Card, StatCard } from "../components/ui/Card";
import { PageSpinner } from "../components/ui/Spinner";
import { CHART_COLORS, formatDate } from "../lib/utils";
import {
  DASHBOARD_TASKS_LIMIT,
  DASHBOARD_RECENT_TASKS_LIMIT,
  DASHBOARD_BAR_CHART_USERS_LIMIT,
} from "../lib/constants";
import { Badge } from "../components/ui/Badge";
import type { TaskStatus } from "../types";

const STATUS_BADGE: Record<TaskStatus, "default" | "info" | "warning" | "success"> = {
  todo: "info",
  in_progress: "info",
  review: "warning",
  done: "success",
};

const chartTextColor = "var(--text-muted)";

export const DashboardPage = memo(() => {
  const { t } = useTranslation();

  const [summaryQuery, tasksQuery, projectsQuery, usersQuery] = useQueries({
    queries: [
      { queryKey: ["dashboard"], queryFn: getDashboard },
      { queryKey: ["tasks"], queryFn: () => getTasks({ limit: DASHBOARD_TASKS_LIMIT }) },
      { queryKey: ["projects"], queryFn: getProjects },
      { queryKey: ["users"], queryFn: getUsers },
    ],
  });

  const summary = summaryQuery.data;
  const tasks = tasksQuery.data;
  const projects = projectsQuery.data;
  const users = usersQuery.data;

  const totalTasks = useMemo(
    () => summary?.byStatus.reduce((sum, item) => sum + item.count, 0) ?? 0,
    [summary],
  );

  const doneTasks = useMemo(
    () => summary?.byStatus.find((item) => item.status === "done")?.count ?? 0,
    [summary],
  );

  const completionPercentage = useMemo(
    () => (totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0),
    [doneTasks, totalTasks],
  );

  const pieData = useMemo(
    () => summary?.byStatus.map((item) => ({ name: t(`status.${item.status}`), value: item.count })) ?? [],
    [summary, t],
  );

  const barData = useMemo(
    () =>
      summary?.byUser.slice(0, DASHBOARD_BAR_CHART_USERS_LIMIT).map((item) => ({
        name: item.user_name.split(" ")[0],
        tasks: item.count,
      })) ?? [],
    [summary],
  );

  const recentTasks = useMemo(
    () => tasks?.slice(0, DASHBOARD_RECENT_TASKS_LIMIT) ?? [],
    [tasks],
  );

  if (summaryQuery.isLoading) return <PageSpinner />;

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.title")}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("dashboard.totalTasks")}
          value={totalTasks}
          icon={<CheckSquare className="h-6 w-6" />}
          variant="blue"
        />
        <StatCard
          title={t("dashboard.completed")}
          value={doneTasks}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="green"
          subtitle={totalTasks ? t("dashboard.completedPct", { pct: completionPercentage }) : undefined}
        />
        <StatCard
          title={t("dashboard.projects")}
          value={projects?.length ?? 0}
          icon={<FolderKanban className="h-6 w-6" />}
          variant="violet"
        />
        <StatCard
          title={t("dashboard.teamMembers")}
          value={users?.length ?? 0}
          icon={<Users className="h-6 w-6" />}
          variant="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-200">{t("dashboard.tasksByStatus")}</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                  }}
                />
                <Legend wrapperStyle={{ color: chartTextColor }} formatter={(value) => <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-200">{t("dashboard.tasksByMember")}</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 8, bottom: 6, left: -8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartTextColor }} />
                <YAxis tick={{ fontSize: 12, fill: chartTextColor }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="tasks" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-200">{t("dashboard.recentTasks")}</h2>

          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("dashboard.noTasksYet")}</p>
          ) : (
            <div className="space-y-2.5">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{formatDate(task.dueDate)}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[task.status]}>{t(`status.${task.status}`)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-200">{t("dashboard.tasksByProject")}</h2>

          {(summary?.byProject ?? []).length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("dashboard.noProjectsYet")}</p>
          ) : (
            <div className="space-y-4">
              {summary?.byProject.map((project) => {
                const pct = totalTasks ? Math.round((project.count / totalTasks) * 100) : 0;

                return (
                  <div key={project.project_id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">{project.project_name}</span>
                      <span className="shrink-0 text-slate-600 dark:text-slate-400">{project.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
});

DashboardPage.displayName = "DashboardPage";
