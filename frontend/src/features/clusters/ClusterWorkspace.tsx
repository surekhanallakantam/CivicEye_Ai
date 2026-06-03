import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';

const clusters = [
  { name: 'Open Manhole Near ABC School', count: 27, priority: 'Critical', confidence: '94%', impact: 'High' },
  { name: 'Streetlight outage near market road', count: 14, priority: 'High', confidence: '91%', impact: 'Medium' },
  { name: 'Drainage overflow near ward 8', count: 31, priority: 'Critical', confidence: '96%', impact: 'High' },
];

export function ClusterWorkspace() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Raw Complaints" value="1,248" />
        <StatCard label="Clusters Found" value="112" tone="accent" />
        <StatCard label="Geographic" value="78" tone="warning" />
        <StatCard label="Non-Geographic" value="34" tone="default" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Cluster Results" description="Grouped complaints after similarity matching.">
          <div className="space-y-3">
            {clusters.map((cluster) => (
              <div key={cluster.name} className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-civic-text">{cluster.name}</div>
                    <div className="mt-1 text-sm text-civic-muted">Affected citizens: {cluster.count}</div>
                  </div>
                  <div className="rounded-full bg-civic-accent/10 px-3 py-1 text-xs text-civic-text">{cluster.priority}</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-civic-muted">
                  <span>Confidence {cluster.confidence}</span>
                  <span>Impact {cluster.impact}</span>
                  <span>Priority {cluster.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Cluster intelligence" description="AI summary and root-cause note.">
          <div className="space-y-4 text-sm text-civic-muted">
            <p>High road safety risk detected near ABC School.</p>
            <p>27 citizens reported the same hazard. Immediate inspection is recommended.</p>
            <p>Root cause hint: recurring manhole cover failures in a dense school corridor.</p>
          </div>
        </SectionCard>

        <SectionCard title="Processing lane" description="Visual placeholder for clustering pipeline stages.">
          <div className="space-y-3 text-sm text-civic-muted">
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Raw complaints</div>
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Embedding / similarity search</div>
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Cluster assignment</div>
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">AI insights</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
