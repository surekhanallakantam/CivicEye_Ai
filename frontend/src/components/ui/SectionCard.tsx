import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <section className={cn('rounded-3xl border border-civic-line bg-civic-panel/90 p-6 shadow-soft backdrop-blur', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-civic-text">{title}</h2>
        {description ? <p className="mt-1 text-sm text-civic-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
