import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TaskPriority, TaskStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
};

export const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function extractErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  const data = (err as {
    response?: {
      data?: {
        message?: string | string[];
        detail?: string | string[];
      };
    };
  })?.response?.data;

  const message = data?.message ?? data?.detail ?? fallback;
  return Array.isArray(message) ? message[0] : message;
}
