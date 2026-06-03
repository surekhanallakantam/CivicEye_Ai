import { AppShell } from '@/components/layout/AppShell';
import { ComplaintTracking } from '@/features/complaints/ComplaintTracking';

export function TrackingPage() {
  return (
    <AppShell>
      <ComplaintTracking />
    </AppShell>
  );
}
