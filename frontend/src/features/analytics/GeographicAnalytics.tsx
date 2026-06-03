import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';

export function GeographicAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Hotspots" value="18" tone="danger" />
        <StatCard label="Cluster Density" value="High" tone="accent" />
        <StatCard label="Geographic Clusters" value="78" />
        <StatCard label="Mapped Zones" value="12" tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Heatmap" description="This will visualize cluster intensity, not raw complaints.">
          <div className="flex min-h-[340px] items-center justify-center rounded-2xl border border-dashed border-civic-line bg-civic-panelSoft text-civic-muted">
            Map canvas placeholder - connect React Leaflet here
          </div>
        </SectionCard>

        <SectionCard title="Hotspot summary" description="Top geographic areas requiring attention.">
          <div className="space-y-3 text-sm text-civic-muted">
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Beach Road - 42 complaints</div>
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">MVP Colony - 28 complaints</div>
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Gajuwaka - 17 complaints</div>
            <div className="rounded-2xl border border-civic-line bg-civic-panelSoft p-4">Ward 8 - 15 complaints</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
