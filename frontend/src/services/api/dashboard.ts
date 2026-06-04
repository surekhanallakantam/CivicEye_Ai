import { apiClient } from './client';

export type ExecutiveStats = {
  total_complaints: number;
  total_departments: number;
  total_clusters: number;
  critical_issues: number;
  resolved_cases: number;
  pending_cases: number;
  complaint_reduction_pct: number;
};

export type DashboardInsight = {
  label: string;
  value: string;
  tone: 'default' | 'accent' | 'warning' | 'danger';
  hint: string;
};

export type DayTrend = {
  name: string;
  complaints: number;
  resolved: number;
};

export type DepartmentLoad = {
  name: string;
  complaints: number;
};

export type ExecutiveDashboardData = {
  stats: ExecutiveStats;
  insights: DashboardInsight[];
  trend: DayTrend[];
  dept_load: DepartmentLoad[];
};

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardData> {
  const response = await apiClient.get('/api/v1/admin/dashboard/executive');
  return response.data;
}
