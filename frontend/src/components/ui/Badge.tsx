import { cn } from "../../lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  children: React.ReactNode;
}

const variants = {
  default:
    "border border-slate-400 bg-slate-300 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
  success:
    "border border-emerald-300 bg-emerald-200 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  warning:
    "border border-amber-300 bg-amber-200 text-amber-900 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300",
  danger:
    "border border-rose-300 bg-rose-200 text-rose-900 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-300",
  info:
    "border border-blue-300 bg-blue-200 text-blue-900 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
