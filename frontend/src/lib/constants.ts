import type { TaskStatus, TaskPriority, UserRole } from '../types';

export const AUTH_TOKEN_KEY = 'tm_token';

export const QUERY_STALE_TIME = 1000 * 60 * 5;
export const QUERY_RETRY_COUNT = 1;

export const DASHBOARD_RECENT_TASKS_LIMIT = 6;
export const DASHBOARD_TASKS_LIMIT = 10;
export const DASHBOARD_BAR_CHART_USERS_LIMIT = 8;

export const getStatusOptions = (t: (key: string) => string): { value: TaskStatus; label: string }[] => [
  { value: 'todo', label: t('status.todo') },
  { value: 'in_progress', label: t('status.in_progress') },
  { value: 'review', label: t('status.review') },
  { value: 'done', label: t('status.done') },
];

export const getPriorityOptions = (t: (key: string) => string): { value: TaskPriority; label: string }[] => [
  { value: 'low', label: t('priority.low') },
  { value: 'medium', label: t('priority.medium') },
  { value: 'high', label: t('priority.high') },
];

export const getRoleOptions = (t: (key: string) => string): { value: UserRole; label: string }[] => [
  { value: 'member', label: t('roles.member') },
  { value: 'admin', label: t('roles.admin') },
];
