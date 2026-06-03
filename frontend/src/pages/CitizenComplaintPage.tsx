import { AppShell } from '@/components/layout/AppShell';
import { ComplaintForm } from '@/features/complaints/ComplaintForm';

export function CitizenComplaintPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <ComplaintForm />
      </div>
    </AppShell>
  );
}
