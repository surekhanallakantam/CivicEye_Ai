import { SectionCard } from '@/components/ui/SectionCard';

export function ComplaintTracking() {
  return (
    <SectionCard title="Track Complaint" description="View complaint progress using the public complaint code.">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          placeholder="Enter complaint code e.g. CIV-2026-0001"
          className="w-full rounded-2xl border border-civic-line bg-civic-panelSoft px-4 py-3 text-civic-text outline-none placeholder:text-civic-muted/60"
        />
        <button className="rounded-2xl bg-civic-accent px-5 py-3 font-semibold text-slate-950">Track</button>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-civic-muted">
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Submitted</div>
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">AI Categorized</div>
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Assigned to Department</div>
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Under Review</div>
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">In Progress</div>
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Resolved</div>
        <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Citizen Feedback</div>
      </div>
    </SectionCard>
  );
}
