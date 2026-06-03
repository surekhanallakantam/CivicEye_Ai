import { AppShell } from '@/components/layout/AppShell';
import { ExecutiveDashboard } from '@/features/dashboard/ExecutiveDashboard';

export function AdminDashboardPage() {
  return (
    <AppShell>
      <ExecutiveDashboard />
    </AppShell>
  );
}
