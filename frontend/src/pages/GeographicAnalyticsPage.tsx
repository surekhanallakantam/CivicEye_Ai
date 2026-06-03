import { AppShell } from '@/components/layout/AppShell';
import { GeographicAnalytics } from '@/features/analytics/GeographicAnalytics';

export function GeographicAnalyticsPage() {
  return (
    <AppShell>
      <GeographicAnalytics />
    </AppShell>
  );
}
