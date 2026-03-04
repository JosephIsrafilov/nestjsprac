import { useState, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  CheckSquare,
  Calendar,
  ChevronDown,
  Activity,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getProjects,
  getUsers,
  getTaskActivity,
} from "../services/api.service";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { Card } from "../components/ui/Card";
import { PageSpinner } from "../components/ui/Spinner";
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatDate,
  formatDateTime,
  cn,
  extractErrorMessage,
} from "../lib/utils";
import { getStatusOptions, getPriorityOptions } from "../lib/constants";
import type { TaskStatus, TaskPriority, Task } from "../types";
import type { TaskActivity } from "../types";
import { useAuthStore } from "../store/auth.store";

const ActivityModal = memo(
  ({ task, onClose }: { task: Task; onClose: () => void }) => {
    const { t } = useTranslation();
    const { data: activities, isLoading } = useQuery<TaskActivity[]>({
      queryKey: ["task-activity", task.id],
      queryFn: () => getTaskActivity(task.id),
    });

    return (
      <Modal
        open
        onClose={onClose}
        title={t("tasks.activityTitle", { title: task.title })}
        size="lg"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : activities?.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            {t("tasks.noActivity")}
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activities?.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">
                      {a.changedByUser?.name ?? t("common.user")}
                    </span>{" "}
                    {a.actionType === "status_changed" && (
                      <>
                        {t("tasks.statusChanged", {
                          oldValue: a.oldValue,
                          newValue: a.newValue,
                        })}
                      </>
                    )}
                    {a.actionType === "reassigned" && (
                      <>{t("tasks.reassigned")}</>
                    )}
                    {a.actionType === "edited" && <>{t("tasks.edited")}</>}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDateTime(a.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    );
  },
);
ActivityModal.displayName = "ActivityModal";

const EditStatusModal = memo(
  ({ task, onClose }: { task: Task; onClose: () => void }) => {
    const qc = useQueryClient();
    const { t } = useTranslation();
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const { data: users } = useQuery({
      queryKey: ["users"],
      queryFn: getUsers,
    });
    const [assignedTo, setAssignedTo] = useState(String(task.assignedTo));

    const statusOptions = useMemo(() => getStatusOptions(t), [t]);
    const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

    const { mutate, isPending } = useMutation({
      mutationFn: () =>
        updateTask(task.id, {
          status,
          priority,
          assigned_to: Number(assignedTo),
        }),
      onSuccess: () => {
        toast.success(t("tasks.updated"));
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        onClose();
      },
      onError: () => toast.error(t("tasks.updateFailed")),
    });

    return (
      <Modal
        open
        onClose={onClose}
        title={t("tasks.editTitle", { title: task.title })}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
          className="space-y-4"
        >
          <Select
            label={t("tasks.statusLabel")}
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label={t("tasks.priorityLabel")}
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
          <Select
            label={t("tasks.assignedTo")}
            options={(users ?? []).map((u) => ({ value: u.id, label: u.name }))}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={t("tasks.selectUser")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("tasks.cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("tasks.saveChanges")}
            </Button>
          </div>
        </form>
      </Modal>
    );
  },
);
EditStatusModal.displayName = "EditStatusModal";

const CreateTaskModal = memo(({ onClose }: { onClose: () => void }) => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const statusOptions = useMemo(() => getStatusOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createTask({
        title,
        description,
        status,
        priority,
        project_id: Number(projectId),
        assigned_to: Number(assignedTo),
        due_date: dueDate || null,
      }),
    onSuccess: () => {
      toast.success(t("tasks.created"));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, "Failed to create task."));
    },
  });

  return (
    <Modal open onClose={onClose} title={t("tasks.newTaskModal")} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <Input
          label={t("tasks.titleLabel")}
          placeholder={t("tasks.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("tasks.descLabel")}
          </label>
          <textarea
            rows={2}
            placeholder={t("tasks.descPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t("tasks.statusLabel")}
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label={t("tasks.priorityLabel")}
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t("tasks.projectLabel")}
            options={(projects ?? []).map((p) => ({
              value: p.id,
              label: p.name,
            }))}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder={t("tasks.selectProject")}
            required
          />
          <Select
            label={t("tasks.assignLabel")}
            options={(users ?? []).map((u) => ({ value: u.id, label: u.name }))}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={t("tasks.selectUser")}
            required
          />
        </div>
        <Input
          label={t("tasks.dueDateLabel")}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("tasks.cancel")}
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={!title.trim() || !projectId || !assignedTo}
          >
            {t("tasks.createTask")}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
CreateTaskModal.displayName = "CreateTaskModal";

const BOARD_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

export const TasksPage = memo(() => {
  const { t } = useTranslation();
  const { isAdmin } = useAuthStore();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDueFrom, setFilterDueFrom] = useState("");
  const [filterDueTo, setFilterDueTo] = useState("");
  const [dragTaskId, setDragTaskId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const statusOptions = useMemo(() => getStatusOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: [
      "tasks",
      filterStatus,
      filterPriority,
      filterSearch,
      filterDueFrom,
      filterDueTo,
    ],
    queryFn: () =>
      getTasks({
        ...(filterStatus ? { status: filterStatus as TaskStatus } : {}),
        ...(filterPriority ? { priority: filterPriority as TaskPriority } : {}),
        ...(filterSearch.trim() ? { search: filterSearch.trim() } : {}),
        ...(filterDueFrom ? { due_from: filterDueFrom } : {}),
        ...(filterDueTo ? { due_to: filterDueTo } : {}),
      }),
  });

  const hasFilters = Boolean(
    filterStatus ||
    filterPriority ||
    filterSearch.trim() ||
    filterDueFrom ||
    filterDueTo,
  );

  const statusLabels = useMemo(() => {
    return new Map(statusOptions.map((item) => [item.value, item.label]));
  }, [statusOptions]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    for (const task of tasks ?? []) {
      grouped[task.status].push(task);
    }

    return grouped;
  }, [tasks]);

  const { mutate: removeTask, isPending: isDeleting } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success(t("tasks.deleted"));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, t("tasks.deleteFailed")));
    },
  });

  const { mutate: moveTask } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTask(taskId, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, t("tasks.moveFailed")));
    },
  });

  const handleDropToStatus = (nextStatus: TaskStatus) => {
    if (dragTaskId === null) {
      return;
    }

    const currentTask = tasks?.find((task) => task.id === dragTaskId);
    setDragTaskId(null);
    setDragOverStatus(null);

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    moveTask({ taskId: currentTask.id, status: nextStatus });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {t("tasks.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("tasks.count", { count: tasks?.length ?? 0 })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder={t("tasks.searchPlaceholder")}
            className="w-52"
          />
          <Input
            type="date"
            value={filterDueFrom}
            onChange={(e) => setFilterDueFrom(e.target.value)}
            className="w-40"
            title={t("tasks.dueFromLabel")}
          />
          <Input
            type="date"
            value={filterDueTo}
            onChange={(e) => setFilterDueTo(e.target.value)}
            className="w-40"
            title={t("tasks.dueToLabel")}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl border bg-white/90 dark:bg-slate-800/65 border-slate-300 dark:border-slate-600 px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            <option value="">{t("tasks.allStatuses")}</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-10 rounded-xl border bg-white/90 dark:bg-slate-800/65 border-slate-300 dark:border-slate-600 px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            <option value="">{t("tasks.allPriorities")}</option>
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterSearch("");
              setFilterDueFrom("");
              setFilterDueTo("");
              setFilterStatus("");
              setFilterPriority("");
            }}
            disabled={!hasFilters}
          >
            {t("tasks.clearFilters")}
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("tasks.newTask")}
          </Button>
        </div>
      </div>

      {(tasks?.length ?? 0) === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-4">
          <CheckSquare className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("tasks.noTasksFound")}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {hasFilters ? t("tasks.adjustFilters") : t("tasks.createFirst")}
            </p>
          </div>
          {!hasFilters && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("tasks.createTask")}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BOARD_STATUS_ORDER.map((status) => {
            const columnTasks = tasksByStatus[status];

            return (
              <Card
                key={status}
                className="min-h-[380px] bg-slate-50 dark:bg-slate-900/50 p-3"
              >
                <div
                  className={cn(
                    "h-full",
                    dragOverStatus === status &&
                      "rounded-lg ring-2 ring-blue-400",
                  )}
                  onDragOver={(event: React.DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    setDragOverStatus(status);
                  }}
                  onDragLeave={() => {
                    setDragOverStatus((prev) =>
                      prev === status ? null : prev,
                    );
                  }}
                  onDrop={() => {
                    handleDropToStatus(status);
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        STATUS_COLORS[status],
                      )}
                    >
                      {statusLabels.get(status) ?? t(`status.${status}`)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-5 text-center text-xs text-slate-400 dark:text-slate-500">
                        {t("tasks.emptyColumn")}
                      </p>
                    ) : (
                      columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            setDragTaskId(task.id);
                          }}
                          onDragEnd={() => {
                            setDragTaskId(null);
                            setDragOverStatus(null);
                          }}
                          className={cn(
                            "rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
                            dragTaskId === task.id && "opacity-60",
                          )}
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {task.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {task.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                PRIORITY_COLORS[task.priority],
                              )}
                            >
                              {t(`priority.${task.priority}`)}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {task.project?.name ?? `#${task.projectId}`}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                              {(task.assignee?.name ?? "?")[0].toUpperCase()}
                            </div>
                            <span className="truncate">
                              {task.assignee?.name ?? task.assignedTo}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            {task.dueDate && (
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                            )}
                            {formatDate(task.dueDate)}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditTask(task)}
                              className="h-7 px-2 text-xs"
                            >
                              {t("tasks.edit")}
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActivityTask(task)}
                              className="h-7 px-2 text-xs"
                            >
                              <Activity className="h-3 w-3" />
                            </Button>
                            {isAdmin() && (
                              <Button
                                size="sm"
                                variant="danger"
                                disabled={isDeleting}
                                onClick={() => {
                                  if (
                                    !window.confirm(
                                      t("tasks.deleteConfirm", {
                                        title: task.title,
                                      }),
                                    )
                                  ) {
                                    return;
                                  }
                                  removeTask(task.id);
                                }}
                                className="h-7 px-2 text-xs"
                              >
                                <Trash2 className="h-3 w-3" />
                                {t("tasks.delete")}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {createOpen && <CreateTaskModal onClose={() => setCreateOpen(false)} />}
      {editTask && (
        <EditStatusModal task={editTask} onClose={() => setEditTask(null)} />
      )}
      {activityTask && (
        <ActivityModal
          task={activityTask}
          onClose={() => setActivityTask(null)}
        />
      )}
    </div>
  );
});
TasksPage.displayName = "TasksPage";
