import { memo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  Calendar,
  Trash2,
  CheckSquare,
  Clock,
  User2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getProjects,
  createProject,
  deleteProject,
  getTasks,
} from "../services/api.service";
import {
  extractErrorMessage,
  cn,
  formatDate,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Card } from "../components/ui/Card";
import { PageSpinner } from "../components/ui/Spinner";
import { useAuthStore } from "../store/auth.store";
import type { Project } from "../types";

const ProjectTasksModal = memo(
  ({ project, onClose }: { project: Project; onClose: () => void }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: tasks, isLoading } = useQuery({
      queryKey: ["tasks", "project", project.id],
      queryFn: () => getTasks({ project_id: project.id }),
    });

    const handleViewInTasks = () => {
      onClose();
      navigate(`/tasks?project_id=${project.id}`);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
              <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="truncate">{project.name}</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDate(project.createdAt)}</span>
              {project.creator && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <User2 className="h-4 w-4 shrink-0" />
                  <span>{project.creator.name}</span>
                </>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={handleViewInTasks}>
              <ExternalLink className="h-3.5 w-3.5" />
              {t("projects.viewAllInTasks")}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (tasks?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <CheckSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("projects.noTasksInProject")}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {tasks?.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 shrink-0"
                      onClick={handleViewInTasks}
                      title={t("projects.openInTasks")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        STATUS_COLORS[task.status],
                      )}
                    >
                      {t(`status.${task.status}`)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        PRIORITY_COLORS[task.priority],
                      )}
                    >
                      {t(`priority.${task.priority}`)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {(task.assignee?.name ?? "?")[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {task.assignee?.name ??
                          t("projects.userFallback", { id: task.assignedTo })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          {t("projects.taskCreated", {
                            date: formatDate(task.createdAt),
                          })}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>
                            {t("projects.taskDue", {
                              date: formatDate(task.dueDate),
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    );
  },
);
ProjectTasksModal.displayName = "ProjectTasksModal";

export const ProjectsPage = memo(() => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { isAdmin } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => createProject({ name, description }),
    onSuccess: () => {
      toast.success(t("projects.created"));
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setName("");
      setDescription("");
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, "Failed to create project."));
    },
  });

  const { mutate: removeProject, isPending: isDeleting } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success(t("projects.deleted"));
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, t("projects.deleteFailed")));
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {t("projects.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("projects.count", { count: projects?.length ?? 0 })}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("projects.newProject")}
        </Button>
      </div>

      {projects?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("projects.noProjectsTitle")}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t("projects.noProjectsHint")}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("projects.createProject")}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger-children">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500/50"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
                  <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    #{project.id}
                  </span>
                  {isAdmin() && (
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-7 px-2"
                      disabled={isDeleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          !window.confirm(
                            t("projects.deleteConfirm", { name: project.name }),
                          )
                        ) {
                          return;
                        }
                        removeProject(project.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {project.description || t("projects.noDescription")}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(project.createdAt)}
                </div>
                <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>{t("projects.viewTasks")}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectTasksModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("projects.modalTitle")}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="space-y-4"
        >
          <Input
            label={t("projects.nameLabel")}
            placeholder={t("projects.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("projects.descLabel")}
            </label>
            <textarea
              rows={3}
              placeholder={t("projects.descPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {t("projects.cancel")}
            </Button>
            <Button type="submit" loading={isPending} disabled={!name.trim()}>
              {t("projects.createProject")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

ProjectsPage.displayName = "ProjectsPage";
