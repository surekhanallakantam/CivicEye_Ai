import { cn } from '@/lib/utils';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'accent' | 'warning' | 'danger';
};

const toneClasses = {
  default: 'border-civic-line bg-civic-panelSoft',
  accent: 'border-civic-accent/40 bg-civic-accent/10',
  warning: 'border-civic-warning/40 bg-civic-warning/10',
  danger: 'border-civic-danger/40 bg-civic-danger/10',
};

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border p-4', toneClasses[tone])}>
      <p className="text-xs uppercase tracking-[0.24em] text-civic-muted">{label}</p>
      <div className="mt-2 text-3xl font-semibold text-civic-text">{value}</div>
      {hint ? <p className="mt-2 text-sm text-civic-muted">{hint}</p> : null}
    </div>
  );
}
