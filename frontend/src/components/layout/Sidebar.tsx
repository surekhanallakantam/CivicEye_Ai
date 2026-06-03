import { NavLink } from 'react-router-dom';
import { Building2, ChartColumnIncreasing, ClipboardList, Layers3, MapPinned, Gauge, FileText } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Gauge },
  { to: '/citizen', label: 'Complaint Form', icon: FileText },
  { to: '/track', label: 'Track Complaint', icon: ClipboardList },
  { to: '/admin', label: 'Executive Dashboard', icon: Building2 },
  { to: '/clusters', label: 'Cluster Workspace', icon: Layers3 },
  { to: '/analytics', label: 'Geographic Analytics', icon: MapPinned },
  { to: '/department', label: 'Department View', icon: ChartColumnIncreasing },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-civic-line bg-civic-panel/95 p-5">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-civic-muted">CivicEye AI</div>
        <h1 className="mt-2 text-2xl font-semibold text-civic-text">Governance Intelligence</h1>
        <p className="mt-2 text-sm text-civic-muted">AI complaint intelligence, clustering, analytics, and transparency.</p>
      </div>

      <nav className="mt-8 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                  isActive ? 'bg-civic-accent text-slate-950' : 'text-civic-text/80 hover:bg-white/5 hover:text-civic-text',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-civic-line bg-civic-panelSoft p-4 text-sm text-civic-muted">
        Stack: React 19, TypeScript, Tailwind, Router, Recharts, Leaflet.
      </div>
    </aside>
  );
}
