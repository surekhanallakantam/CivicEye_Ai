import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ComplaintForm } from '@/features/complaints/ComplaintForm';
import { MyComplaints } from '@/features/complaints/MyComplaints';

export function CitizenComplaintPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('civiceye_token'));
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        <ComplaintForm />
        {isLoggedIn && <MyComplaints />}
      </div>
    </AppShell>
  );
}
