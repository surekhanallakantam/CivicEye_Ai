import { AppShell } from '@/components/layout/AppShell';
import { SectionCard } from '@/components/ui/SectionCard';

export function DepartmentPage() {
  return (
    <AppShell>
      <SectionCard title="Department Dashboard" description="Filters, complaints, status updates, and clustering controls will live here.">
        <div className="grid gap-4 md:grid-cols-3 text-sm text-civic-muted">
          <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Complaint table</div>
          <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Filter controls</div>
          <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Run clustering button</div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
