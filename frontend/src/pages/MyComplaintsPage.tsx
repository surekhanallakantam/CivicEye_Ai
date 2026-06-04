import { Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { MyComplaints } from '@/features/complaints/MyComplaints';

export function MyComplaintsPage() {
  const token = localStorage.getItem('civiceye_token');

  // Enforce citizen login to access complaint history
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <MyComplaints />
    </AppShell>
  );
}
