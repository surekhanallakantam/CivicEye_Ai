import { NavLink, useLocation } from 'react-router-dom';
import { Building2, ChartColumnIncreasing, ClipboardList, Layers3, MapPinned, Gauge, FileText, Home, LogOut, LayoutList } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const isAdminPath = ['/admin', '/clusters', '/analytics', '/department'].some((path) =>
    location.pathname.startsWith(path)
  );

  const citizenLinks = [
    { to: '/', label: 'Home Portal', icon: Home },
    { to: '/citizen', label: 'Raise Complaint', icon: FileText },
    { to: '/my-complaints', label: 'My Complaints', icon: LayoutList },
    { to: '/track', label: 'Track Complaint', icon: ClipboardList },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: Building2 },
    { to: '/clusters', label: 'Cluster Workspace', icon: Layers3 },
    { to: '/analytics', label: 'Geographic Analytics', icon: MapPinned },
    { to: '/department', label: 'Department View', icon: ChartColumnIncreasing },
  ];

  const links = isAdminPath ? adminLinks : citizenLinks;
  const roleName = isAdminPath ? 'Admin Console' : 'Citizen Portal';

  const handleAdminLogout = () => {
    localStorage.removeItem('civiceye_admin_token');
    localStorage.removeItem('civiceye_admin_user');
    window.location.reload();
  };

  // Theme styling based on role
  const asideBg = isAdminPath ? 'bg-[#0b1d2d] border-[#1e3a52]' : 'bg-white border-civic-line';
  const textTitle = isAdminPath ? 'text-[#e6f1ff]' : 'text-[#0a192f]';
  const textMuted = isAdminPath ? 'text-[#89a7c7]' : 'text-civic-muted';
  const activeClass = isAdminPath ? 'bg-[#10283d] text-[#4fd1c5] border border-[#1e3a52]' : 'bg-civic-primary/10 text-civic-primary';
  const inactiveClass = isAdminPath ? 'text-[#89a7c7] hover:bg-[#10283d] hover:text-[#e6f1ff]' : 'text-civic-text/80 hover:bg-civic-surfaceSoft hover:text-civic-text';

  return (
    <aside className={`flex h-full w-full flex-col border-r p-5 ${asideBg} transition-colors duration-200 justify-between`}>
      <div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.35em] text-[#FF9933] font-bold">CivicEye AI</div>
          <h1 className={`mt-2 text-xl font-extrabold ${textTitle}`}>{roleName}</h1>
          <p className={`mt-2 text-xs leading-relaxed ${textMuted}`}>
            National Redressal and Public grievance redirection system.
          </p>
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
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    isActive ? activeClass : inactiveClass,
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {isAdminPath && (
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-950/20 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout Console
          </button>
        )}
        <div className={`rounded-2xl border p-4 text-xs ${isAdminPath ? 'border-[#1e3a52] bg-[#10283d] text-[#89a7c7]' : 'border-civic-line bg-civic-surfaceSoft text-civic-muted'}`}>
          Digital India Grievance Redressal platform.
        </div>
      </div>
    </aside>
  );
}
