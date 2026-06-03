import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';

const chartData = [
  { name: 'Mon', complaints: 34, resolved: 20 },
  { name: 'Tue', complaints: 41, resolved: 26 },
  { name: 'Wed', complaints: 28, resolved: 22 },
  { name: 'Thu', complaints: 55, resolved: 31 },
  { name: 'Fri', complaints: 49, resolved: 38 },
];

export function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Complaints" value="1,248" tone="accent" />
        <StatCard label="Total Departments" value="8" />
        <StatCard label="Total Clusters" value="112" />
        <StatCard label="Critical Issues" value="27" tone="danger" />
        <StatCard label="Resolved Cases" value="910" tone="default" />
        <StatCard label="Pending Cases" value="311" tone="warning" />
      </div>

      <SectionCard title="AI Summary" description="Leadership-focused signal card for the current week.">
        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="Drainage risk" value="+23%" tone="danger" hint="More complaints in coastal wards" />
          <StatCard label="Highest risk zone" value="Beach Road" tone="accent" hint="Cluster density elevated" />
          <StatCard label="Pension delays" value="-12%" tone="default" hint="Improved turnaround this week" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Complaint trend" description="Raw complaint and resolution flow for the week.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
                <XAxis dataKey="name" stroke="#89a7c7" />
                <YAxis stroke="#89a7c7" />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#4fd1c5" strokeWidth={3} />
                <Line type="monotone" dataKey="resolved" stroke="#6ea8fe" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Department load" description="Complaints by department bucket.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
                <XAxis dataKey="name" stroke="#89a7c7" />
                <YAxis stroke="#89a7c7" />
                <Tooltip />
                <Bar dataKey="complaints" fill="#4fd1c5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
