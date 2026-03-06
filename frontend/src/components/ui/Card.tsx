import { cn } from "../../lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-700 dark:bg-slate-800",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export type StatVariant = "blue" | "green" | "violet" | "orange";

const STAT_VARIANTS: Record<
  StatVariant,
  { iconWrap: string; iconColor: string; topBorder: string }
> = {
  blue: {
    iconWrap: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-300",
    topBorder: "border-t-blue-500",
  },
  green: {
    iconWrap: "bg-emerald-100 dark:bg-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    topBorder: "border-t-emerald-500",
  },
  violet: {
    iconWrap: "bg-violet-100 dark:bg-violet-900",
    iconColor: "text-violet-600 dark:text-violet-300",
    topBorder: "border-t-violet-500",
  },
  orange: {
    iconWrap: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-600 dark:text-orange-300",
    topBorder: "border-t-orange-500",
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: StatVariant;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  variant = "blue",
  subtitle,
}: StatCardProps) {
  const v = STAT_VARIANTS[variant];

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        "dark:border-slate-700 dark:bg-slate-800",
        v.topBorder,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </p>
          <p className="mt-1 text-4xl font-bold leading-none tabular-nums text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            v.iconWrap,
            v.iconColor,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
