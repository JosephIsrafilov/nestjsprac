export const USER_ROLE = {
  admin: 'admin',
  member: 'member',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const TASK_STATUS = {
  todo: 'todo',
  in_progress: 'in_progress',
  review: 'review',
  done: 'done',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const TASK_ACTION_TYPE = {
  status_changed: 'status_changed',
  reassigned: 'reassigned',
  edited: 'edited',
} as const;
