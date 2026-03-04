import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-100";

const variants = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500 disabled:bg-indigo-400 disabled:text-white",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-400",
  ghost:
    "text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:active:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-500",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-400 disabled:text-white",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
