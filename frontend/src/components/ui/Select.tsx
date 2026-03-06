import { forwardRef } from "react";
import { cn } from "../../lib/utils";

type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
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
        <select
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm",
            "border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
