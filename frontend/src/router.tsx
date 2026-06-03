import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CitizenComplaintPage } from '@/pages/CitizenComplaintPage';
import { TrackingPage } from '@/pages/TrackingPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ClusterWorkspacePage } from '@/pages/ClusterWorkspacePage';
import { GeographicAnalyticsPage } from '@/pages/GeographicAnalyticsPage';
import { DepartmentPage } from '@/pages/DepartmentPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/citizen" element={<CitizenComplaintPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/clusters" element={<ClusterWorkspacePage />} />
        <Route path="/analytics" element={<GeographicAnalyticsPage />} />
        <Route path="/department" element={<DepartmentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
