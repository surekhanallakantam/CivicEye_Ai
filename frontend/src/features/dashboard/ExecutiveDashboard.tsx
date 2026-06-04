import { useState, useEffect } from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import {
  getExecutiveDashboardData,
  type ExecutiveDashboardData
} from '@/services/api/dashboard';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';

export function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await getExecutiveDashboardData();
      setData(res);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    window.addEventListener('ws-complaint_created', loadDashboard);
    window.addEventListener('ws-complaint_updated', loadDashboard);
    return () => {
      window.removeEventListener('ws-complaint_created', loadDashboard);
      window.removeEventListener('ws-complaint_updated', loadDashboard);
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0a2240] border-t-transparent" />
          <span className="text-sm font-semibold">Loading Executive Summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Complaints" value={data.stats.total_complaints.toLocaleString()} tone="accent" />
        <StatCard label="Total Departments" value={data.stats.total_departments} />
        <StatCard label="Total Clusters" value={data.stats.total_clusters} />
        <StatCard label="Critical Issues" value={data.stats.critical_issues} tone="danger" />
        <StatCard label="Resolved Cases" value={data.stats.resolved_cases.toLocaleString()} tone="default" />
        <StatCard label="Pending Cases" value={data.stats.pending_cases.toLocaleString()} tone="warning" />
      </div>

      {/* <SectionCard title="AI Summary" description="Leadership-focused signal card derived from real-time database grievances.">
        <div className="grid gap-3 md:grid-cols-3">
          {data.insights.map((insight, idx) => (
            <StatCard
              key={idx}
              label={insight.label}
              value={insight.value}
              tone={insight.tone}
              hint={insight.hint}
            />
          ))}
        </div>
      </SectionCard> */}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Complaint trend" description="Combined historical baseline and real weekly complaint flow.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#FF9933" strokeWidth={3} />
                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Department load" description="Active complaint volume distributed across administrative boards.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dept_load}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="complaints" fill="#1d5fe0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
