import { AppShell } from '@/components/layout/AppShell';
import { ClusterWorkspace } from '@/features/clusters/ClusterWorkspace';

export function ClusterWorkspacePage() {
  return (
    <AppShell>
      <ClusterWorkspace />
    </AppShell>
  );
}
