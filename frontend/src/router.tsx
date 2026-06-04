import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CitizenComplaintPage } from '@/pages/CitizenComplaintPage';
import { TrackingPage } from '@/pages/TrackingPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ClusterWorkspacePage } from '@/pages/ClusterWorkspacePage';
import { GeographicAnalyticsPage } from '@/pages/GeographicAnalyticsPage';
import { DepartmentPage } from '@/pages/DepartmentPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { MyComplaintsPage } from '@/pages/MyComplaintsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/citizen" element={<CitizenComplaintPage />} />
        <Route path="/my-complaints" element={<MyComplaintsPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/clusters" element={<ClusterWorkspacePage />} />
        <Route path="/analytics" element={<GeographicAnalyticsPage />} />
        <Route path="/department" element={<DepartmentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  );
}
