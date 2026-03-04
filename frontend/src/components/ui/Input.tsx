import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
            "border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
