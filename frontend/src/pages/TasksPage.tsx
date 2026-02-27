import { useState, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckSquare, Calendar, ChevronDown, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  getTasks,
  createTask,
  updateTask,
  getProjects,
  getUsers,
  getTaskActivity,
} from '../services/api.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatDate,
  formatDateTime,
  cn,
  extractErrorMessage,
} from '../lib/utils';
import { getStatusOptions, getPriorityOptions } from '../lib/constants';
import type { TaskStatus, TaskPriority, Task } from '../types';
import type { TaskActivity } from '../types';

const ActivityModal = memo(({ task, onClose }: { task: Task; onClose: () => void }) => {
  const { t } = useTranslation();
  const { data: activities, isLoading } = useQuery<TaskActivity[]>({
    queryKey: ['task-activity', task.id],
    queryFn: () => getTaskActivity(task.id),
  });

  return (
    <Modal open onClose={onClose} title={t('tasks.activityTitle', { title: task.title })} size="lg">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : activities?.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{t('tasks.noActivity')}</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {activities?.map((a) => (
            <div key={a.id} className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{a.changedByUser?.name ?? t('common.user')}</span>{' '}
                  {a.actionType === 'status_changed' && (
                    <>{t('tasks.statusChanged', { oldValue: a.oldValue, newValue: a.newValue })}</>
                  )}
                  {a.actionType === 'reassigned' && (
                    <>{t('tasks.reassigned')}</>
                  )}
                  {a.actionType === 'edited' && (
                    <>{t('tasks.edited')}</>
                  )}
                </p>
                <p className="text-xs text-slate-400">{formatDateTime(a.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
});
ActivityModal.displayName = 'ActivityModal';

const EditStatusModal = memo(({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers });
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
      toast.success(t('tasks.updated'));
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: () => toast.error(t('tasks.updateFailed')),
  });

  return (
    <Modal open onClose={onClose} title={t('tasks.editTitle', { title: task.title })}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <Select
          label={t('tasks.statusLabel')}
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        />
        <Select
          label={t('tasks.priorityLabel')}
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        />
        <Select
          label={t('tasks.assignedTo')}
          options={(users ?? []).map((u) => ({ value: u.id, label: u.name }))}
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder={t('tasks.selectUser')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('tasks.cancel')}
          </Button>
          <Button type="submit" loading={isPending}>
            {t('tasks.saveChanges')}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
EditStatusModal.displayName = 'EditStatusModal';

const CreateTaskModal = memo(({ onClose }: { onClose: () => void }) => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: getProjects });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const statusOptions = useMemo(() => getStatusOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

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
      toast.success(t('tasks.created'));
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to create task.'));
    },
  });

  return (
    <Modal open onClose={onClose} title={t('tasks.newTaskModal')} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <Input
          label={t('tasks.titleLabel')}
          placeholder={t('tasks.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{t('tasks.descLabel')}</label>
          <textarea
            rows={2}
            placeholder={t('tasks.descPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('tasks.statusLabel')}
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label={t('tasks.priorityLabel')}
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('tasks.projectLabel')}
            options={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder={t('tasks.selectProject')}
            required
          />
          <Select
            label={t('tasks.assignLabel')}
            options={(users ?? []).map((u) => ({ value: u.id, label: u.name }))}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={t('tasks.selectUser')}
            required
          />
        </div>
        <Input
          label={t('tasks.dueDateLabel')}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('tasks.cancel')}
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={!title.trim() || !projectId || !assignedTo}
          >
            {t('tasks.createTask')}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
CreateTaskModal.displayName = 'CreateTaskModal';

export const TasksPage = memo(() => {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activityTask, setActivityTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const statusOptions = useMemo(() => getStatusOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filterStatus, filterPriority],
    queryFn: () =>
      getTasks({
        ...(filterStatus ? { status: filterStatus as TaskStatus } : {}),
        ...(filterPriority ? { priority: filterPriority as TaskPriority } : {}),
      }),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('tasks.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('tasks.count', { count: tasks?.length ?? 0 })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t('tasks.allStatuses')}</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t('tasks.allPriorities')}</option>
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('tasks.newTask')}
          </Button>
        </div>
      </div>

      {tasks?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-4">
          <CheckSquare className="h-12 w-12 text-slate-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">{t('tasks.noTasksFound')}</p>
            <p className="text-xs text-slate-400">
              {filterStatus || filterPriority
                ? t('tasks.adjustFilters')
                : t('tasks.createFirst')}
            </p>
          </div>
          {!filterStatus && !filterPriority && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('tasks.createTask')}
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colTask')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colStatus')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colPriority')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colProject')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colAssignee')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colDue')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('tasks.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks?.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{task.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[task.status]
                        )}
                      >
                        {t(`status.${task.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          PRIORITY_COLORS[task.priority]
                        )}
                      >
                        {t(`priority.${task.priority}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600">
                        {task.project?.name ?? `#${task.projectId}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shrink-0">
                          {(task.assignee?.name ?? '?')[0].toUpperCase()}
                        </div>
                        <span className="text-slate-600 truncate max-w-24">
                          {task.assignee?.name ?? task.assignedTo}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-slate-500">
                        {task.dueDate && <Calendar className="h-3.5 w-3.5 shrink-0" />}
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditTask(task)}
                          className="h-7 text-xs"
                        >
                          {t('tasks.edit')}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActivityTask(task)}
                          className="h-7 text-xs"
                        >
                          <Activity className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {createOpen && <CreateTaskModal onClose={() => setCreateOpen(false)} />}
      {editTask && <EditStatusModal task={editTask} onClose={() => setEditTask(null)} />}
      {activityTask && <ActivityModal task={activityTask} onClose={() => setActivityTask(null)} />}
    </div>
  );
});
TasksPage.displayName = 'TasksPage';
