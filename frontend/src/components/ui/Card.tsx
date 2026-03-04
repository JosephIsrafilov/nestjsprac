import { cn } from '../../lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.5)] backdrop-blur-sm',
        'dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_25px_46px_-32px_rgba(2,6,23,0.9)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  color = 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
  subtitle,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', color)}>{icon}</div>
      </div>
    </Card>
  );
}
