import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskPriority, TaskStatus } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "border border-sky-300 bg-sky-200 text-sky-900 dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  in_progress:
    "border border-blue-300 bg-blue-200 text-blue-900 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  review:
    "border border-amber-300 bg-amber-200 text-amber-900 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  done: "border border-emerald-300 bg-emerald-200 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "border border-slate-400 bg-slate-300 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200",
  medium:
    "border border-orange-300 bg-orange-200 text-orange-900 dark:border-orange-800 dark:bg-orange-500/20 dark:text-orange-200",
  high: "border border-rose-300 bg-rose-200 text-rose-900 dark:border-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
};

export const CHART_COLORS = [
  "#3b82f6",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function extractErrorMessage(
  err: unknown,
  fallback = "An error occurred",
): string {
  const data = (
    err as {
      response?: {
        data?: {
          message?: string | string[];
          detail?: string | string[];
        };
      };
    }
  )?.response?.data;

  const message = data?.message ?? data?.detail ?? fallback;
  return Array.isArray(message) ? message[0] : message;
}
