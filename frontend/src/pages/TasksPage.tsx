import { memo, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  Calendar,
  CheckSquare,
  ChevronDown,
  MessageSquare,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  createTag,
  createTask,
  createTaskComment,
  deleteTask,
  getProjects,
  getTags,
  getTaskActivity,
  getTaskComments,
  getTasks,
  getUsers,
  updateTask,
} from "../services/api.service";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";
import { getPriorityOptions, getStatusOptions } from "../lib/constants";
import {
  PRIORITY_COLORS,
  STATUS_COLORS,
  cn,
  extractErrorMessage,
  formatDate,
  formatDateTime,
} from "../lib/utils";
import { useAuthStore } from "../store/auth.store";
import type {
  Comment,
  CreateTagDto,
  Tag as TaskTag,
  Task,
  TaskActivity,
  TaskPriority,
  TaskStatus,
  User,
} from "../types";

const TAG_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#64748b",
];

const SELECT_FILTER_CLASS =
  "h-10 rounded-xl border border-slate-300 bg-white/90 px-3 text-sm text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/65 dark:text-slate-200";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500";

const BOARD_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

const createStatusBuckets = (): Record<TaskStatus, Task[]> => ({
  todo: [],
  in_progress: [],
  review: [],
  done: [],
});

const groupTasksByStatus = (tasks: Task[] | undefined): Record<TaskStatus, Task[]> =>
  (tasks ?? []).reduce((accumulator, task) => {
    accumulator[task.status].push(task);
    return accumulator;
  }, createStatusBuckets());

const buildTasksQuery = ({
  filterStatus,
  filterPriority,
  search,
  filterProject,
  filterDueFrom,
  filterDueTo,
}: {
  filterStatus: string;
  filterPriority: string;
  search: string;
  filterProject: string;
  filterDueFrom: string;
  filterDueTo: string;
}) => ({
  ...(filterStatus ? { status: filterStatus as TaskStatus } : {}),
  ...(filterPriority ? { priority: filterPriority as TaskPriority } : {}),
  ...(search.trim() ? { search: search.trim() } : {}),
  ...(filterProject ? { project_id: Number(filterProject) } : {}),
  ...(filterDueFrom ? { due_from: filterDueFrom } : {}),
  ...(filterDueTo ? { due_to: filterDueTo } : {}),
});

const toUserOptions = (users?: User[]) =>
  (users ?? []).map((user) => ({
    value: user.id,
    label: user.name,
  }));

const TagBadge = memo(({ tag }: { tag: TaskTag }) => (
  <span
    className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
    style={{
      borderColor: `${tag.color}55`,
      backgroundColor: `${tag.color}1a`,
      color: tag.color,
    }}
  >
    {tag.name}
  </span>
));
TagBadge.displayName = "TagBadge";

const TagPicker = memo(
  ({
    selectedTagIds,
    onChange,
  }: {
    selectedTagIds: number[];
    onChange: (next: number[]) => void;
  }) => {
    const qc = useQueryClient();
    const { t } = useTranslation();
    const { data: tags, isLoading } = useQuery({
      queryKey: ["tags"],
      queryFn: getTags,
    });

    const [draftName, setDraftName] = useState("");
    const [draftColor, setDraftColor] = useState(TAG_SWATCHES[7]);

    const { mutate: createTagMutation, isPending } = useMutation({
      mutationFn: (dto: CreateTagDto) => createTag(dto),
      onSuccess: (createdTag) => {
        toast.success(t("tasks.tagCreated"));
        qc.invalidateQueries({ queryKey: ["tags"] });
        onChange(
          selectedTagIds.includes(createdTag.id)
            ? selectedTagIds
            : [...selectedTagIds, createdTag.id],
        );
        setDraftName("");
      },
      onError: (error: unknown) => {
        toast.error(extractErrorMessage(error, t("tasks.createTagFailed")));
      },
    });

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Tag className="h-4 w-4" />
          <span>{t("tasks.tagsLabel")}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(tags ?? []).map((tag) => {
            const active = selectedTagIds.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  onChange(
                    active
                      ? selectedTagIds.filter((id) => id !== tag.id)
                      : [...selectedTagIds, tag.id],
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-transform hover:-translate-y-0.5",
                  active && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800",
                )}
                style={{
                  borderColor: `${tag.color}66`,
                  backgroundColor: active ? `${tag.color}26` : `${tag.color}12`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        {!isLoading && (tags?.length ?? 0) === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("tasks.tagsEmpty")}
          </p>
        )}

        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder={t("tasks.newTagName")}
            />
            <Button
              type="button"
              loading={isPending}
              disabled={!draftName.trim()}
              onClick={() =>
                createTagMutation({
                  name: draftName.trim(),
                  color: draftColor,
                })
              }
            >
              <Plus className="h-4 w-4" />
              {t("tasks.createTag")}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {TAG_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setDraftColor(color)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                  draftColor === color
                    ? "border-slate-900 dark:border-slate-100"
                    : "border-transparent",
                )}
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
);
TagPicker.displayName = "TagPicker";

const CommentsModal = memo(
  ({ task, onClose }: { task: Task; onClose: () => void }) => {
    const qc = useQueryClient();
    const { t } = useTranslation();
    const [content, setContent] = useState("");

    const { data: comments, isLoading } = useQuery<Comment[]>({
      queryKey: ["task-comments", task.id],
      queryFn: () => getTaskComments(task.id),
    });

    const { mutate, isPending } = useMutation({
      mutationFn: () => createTaskComment(task.id, { content: content.trim() }),
      onSuccess: () => {
        toast.success(t("tasks.commentAdded"));
        setContent("");
        qc.invalidateQueries({ queryKey: ["task-comments", task.id] });
        qc.invalidateQueries({ queryKey: ["tasks"] });
      },
      onError: (error: unknown) => {
        toast.error(extractErrorMessage(error, t("tasks.addCommentFailed")));
      },
    });

    return (
      <Modal
        open
        onClose={onClose}
        title={t("tasks.commentsTitle", { title: task.title })}
        size="lg"
      >
        <div className="space-y-4">
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : comments?.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                {t("tasks.noComments")}
              </p>
            ) : (
              comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {comment.author?.name ?? t("common.user")}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutate();
            }}
            className="space-y-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("tasks.addComment")}
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t("tasks.commentPlaceholder")}
                className={TEXTAREA_CLASS}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                {t("tasks.cancel")}
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={!content.trim()}
              >
                {t("tasks.sendComment")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  },
);
CommentsModal.displayName = "CommentsModal";

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
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : activities?.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {t("tasks.noActivity")}
          </p>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {activities?.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">
                      {activity.changedByUser?.name ?? t("common.user")}
                    </span>{" "}
                    {activity.actionType === "status_changed" && (
                      <>
                        {t("tasks.statusChanged", {
                          oldValue: activity.oldValue,
                          newValue: activity.newValue,
                        })}
                      </>
                    )}
                    {activity.actionType === "reassigned" && (
                      <>{t("tasks.reassigned")}</>
                    )}
                    {activity.actionType === "edited" && (
                      <>{t("tasks.edited")}</>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDateTime(activity.timestamp)}
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

const EditTaskModal = memo(
  ({ task, onClose }: { task: Task; onClose: () => void }) => {
    const qc = useQueryClient();
    const { t } = useTranslation();
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
      task.tags.map((tag) => tag.id),
    );
    const { data: users } = useQuery({
      queryKey: ["users"],
      queryFn: getUsers,
    });
    const userOptions = useMemo(() => toUserOptions(users), [users]);
    const [assignedTo, setAssignedTo] = useState(String(task.assignedTo));

    const statusOptions = useMemo(() => getStatusOptions(t), [t]);
    const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

    const { mutate, isPending } = useMutation({
      mutationFn: () =>
        updateTask(task.id, {
          status,
          priority,
          assigned_to: Number(assignedTo),
          tag_ids: selectedTagIds,
        }),
      onSuccess: () => {
        toast.success(t("tasks.updated"));
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        onClose();
      },
      onError: (error: unknown) => {
        toast.error(extractErrorMessage(error, t("tasks.updateFailed")));
      },
    });

    return (
      <Modal
        open
        onClose={onClose}
        title={t("tasks.editTitle", { title: task.title })}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate();
          }}
          className="space-y-4"
        >
          <Select
            label={t("tasks.statusLabel")}
            options={statusOptions}
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          />
          <Select
            label={t("tasks.priorityLabel")}
            options={priorityOptions}
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
          />
          <Select
            label={t("tasks.assignedTo")}
            options={userOptions}
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            placeholder={t("tasks.selectUser")}
          />
          <TagPicker
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
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
EditTaskModal.displayName = "EditTaskModal";

const CreateTaskModal = memo(({ onClose }: { onClose: () => void }) => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const userOptions = useMemo(() => toUserOptions(users), [users]);
  const { user, isAdmin } = useAuthStore();

  const statusOptions = useMemo(() => getStatusOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const memberOnlyOwnProjects = !isAdmin();

  const projectOptions = useMemo(
    () =>
      (projects ?? []).map((project) => {
        const isOwn = project.createdBy === user?.id;
        return {
          value: project.id,
          label: isOwn
            ? `★ ${project.name}`
            : memberOnlyOwnProjects
              ? `${project.name} (unavailable)`
              : project.name,
          disabled: memberOnlyOwnProjects && !isOwn,
        };
      }),
    [memberOnlyOwnProjects, projects, user?.id],
  );

  const effectiveProjectId = projectOptions.some(
    (option) => String(option.value) === projectId && !option.disabled,
  )
    ? projectId
    : String(projectOptions.find((option) => !option.disabled)?.value ?? "");

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createTask({
        title,
        description,
        status,
        priority,
        project_id: Number(effectiveProjectId),
        assigned_to: Number(assignedTo),
        due_date: dueDate || null,
        tag_ids: selectedTagIds,
      }),
    onSuccess: () => {
      toast.success(t("tasks.created"));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to create task."));
    },
  });

  return (
    <Modal open onClose={onClose} title={t("tasks.newTaskModal")} size="lg">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <Input
          label={t("tasks.titleLabel")}
          placeholder={t("tasks.titlePlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
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
            onChange={(event) => setDescription(event.target.value)}
            className={TEXTAREA_CLASS}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t("tasks.statusLabel")}
            options={statusOptions}
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          />
          <Select
            label={t("tasks.priorityLabel")}
            options={priorityOptions}
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t("tasks.projectLabel")}
            options={projectOptions}
            value={effectiveProjectId}
            onChange={(event) => setProjectId(event.target.value)}
            placeholder={t("tasks.selectProject")}
            required
          />
          <Select
            label={t("tasks.assignLabel")}
            options={userOptions}
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            placeholder={t("tasks.selectUser")}
            required
          />
        </div>
        {memberOnlyOwnProjects && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your projects are marked with ★. Other projects are unavailable.
          </p>
        )}
        <TagPicker selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
        <Input
          label={t("tasks.dueDateLabel")}
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("tasks.cancel")}
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={!title.trim() || !effectiveProjectId || !assignedTo}
          >
            {t("tasks.createTask")}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
CreateTaskModal.displayName = "CreateTaskModal";

export const TasksPage = memo(() => {
  const { t } = useTranslation();
  const { isAdmin } = useAuthStore();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterProject, setFilterProject] = useState(
    () => searchParams.get("project_id") ?? "",
  );
  const [filterDueFrom, setFilterDueFrom] = useState("");
  const [filterDueTo, setFilterDueTo] = useState("");
  const [dragTaskId, setDragTaskId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filterSearch), 350);
    return () => clearTimeout(timer);
  }, [filterSearch]);

  useEffect(() => {
    const projectId = searchParams.get("project_id");
    if (projectId) {
      navigate("/tasks", { replace: true });
    }
  }, [navigate, searchParams]);

  const statusOptions = useMemo(() => getStatusOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: [
      "tasks",
      filterStatus,
      filterPriority,
      debouncedSearch,
      filterProject,
      filterDueFrom,
      filterDueTo,
    ],
    queryFn: () =>
      getTasks(
        buildTasksQuery({
          filterStatus,
          filterPriority,
          search: debouncedSearch,
          filterProject,
          filterDueFrom,
          filterDueTo,
        }),
      ),
    placeholderData: (previous) => previous,
  });

  const hasFilters = Boolean(
    filterStatus ||
      filterPriority ||
      filterSearch.trim() ||
      filterProject ||
      filterDueFrom ||
      filterDueTo,
  );

  const statusLabels = useMemo(
    () => new Map(statusOptions.map((option) => [option.value, option.label])),
    [statusOptions],
  );

  const tasksByStatus = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const { mutate: removeTask, isPending: isDeleting } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success(t("tasks.deleted"));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, t("tasks.deleteFailed")));
    },
  });

  const { mutate: moveTask } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTask(taskId, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, t("tasks.moveFailed")));
    },
  });

  const handleDropToStatus = (nextStatus: TaskStatus) => {
    const task = tasks?.find((item) => item.id === dragTaskId);
    setDragTaskId(null);
    setDragOverStatus(null);

    if (task && task.status !== nextStatus) {
      moveTask({ taskId: task.id, status: nextStatus });
    }
  };

  const clearFilters = () => {
    setFilterSearch("");
    setDebouncedSearch("");
    setFilterDueFrom("");
    setFilterDueTo("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterProject("");
  };

  if (isLoading) {
    return <PageSpinner />;
  }

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
            onChange={(event) => setFilterSearch(event.target.value)}
            placeholder={t("tasks.searchPlaceholder")}
            className="w-52"
          />
          <Input
            type="date"
            value={filterDueFrom}
            onChange={(event) => setFilterDueFrom(event.target.value)}
            className="w-40"
            title={t("tasks.dueFromLabel")}
          />
          <Input
            type="date"
            value={filterDueTo}
            onChange={(event) => setFilterDueTo(event.target.value)}
            className="w-40"
            title={t("tasks.dueToLabel")}
          />
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className={SELECT_FILTER_CLASS}
          >
            <option value="">{t("tasks.allStatuses")}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(event) => setFilterPriority(event.target.value)}
            className={SELECT_FILTER_CLASS}
          >
            <option value="">{t("tasks.allPriorities")}</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filterProject}
            onChange={(event) => setFilterProject(event.target.value)}
            className={SELECT_FILTER_CLASS}
          >
            <option value="">{t("tasks.allProjects")}</option>
            {(projects ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={clearFilters}
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
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
          {BOARD_STATUS_ORDER.map((status) => {
            const columnTasks = tasksByStatus[status];

            return (
              <Card
                key={status}
                className="min-h-[380px] bg-slate-50 p-3 dark:bg-slate-900/50"
              >
                <div
                  className={cn(
                    "h-full min-h-[150px] rounded-lg border-2 border-transparent transition-all duration-300",
                    dragOverStatus === status &&
                      "scale-[1.02] border-blue-400/50 bg-blue-500/10 dark:bg-blue-400/10",
                  )}
                  onDragOver={(event: React.DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    setDragOverStatus(status);
                  }}
                  onDragLeave={() => {
                    setDragOverStatus((current) =>
                      current === status ? null : current,
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
                      <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
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
                            "cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800",
                            dragTaskId === task.id &&
                              "scale-[0.97] opacity-40 shadow-none ring-2 ring-blue-500/50",
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

                          {task.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {task.tags.map((tag) => (
                                <TagBadge key={tag.id} tag={tag} />
                              ))}
                            </div>
                          )}

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

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>
                              {t("tasks.commentsCount", {
                                count: task._count?.comments ?? 0,
                              })}
                            </span>
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
                              onClick={() => setCommentsTask(task)}
                              className="h-7 px-2 text-xs"
                            >
                              <MessageSquare className="h-3 w-3" />
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
        <EditTaskModal task={editTask} onClose={() => setEditTask(null)} />
      )}
      {commentsTask && (
        <CommentsModal
          task={commentsTask}
          onClose={() => setCommentsTask(null)}
        />
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
