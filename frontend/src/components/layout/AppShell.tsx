import { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AdminLoginForm } from './AdminLoginForm';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isAdminPath = ['/admin', '/clusters', '/analytics', '/department'].some((path) =>
    location.pathname.startsWith(path)
  );

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setIsAdminLoggedIn(!!localStorage.getItem('civiceye_admin_token'));
  }, [location.pathname]);

  if (isAdminPath && !isAdminLoggedIn) {
    return <AdminLoginForm onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  // Theme configuration based on admin vs citizen path
  const shellBg = isAdminPath ? 'bg-[#07131f] text-[#e6f1ff]' : 'bg-civic-page text-civic-text';
  const mainBg = isAdminPath ? 'bg-[#0b1d2d]' : 'bg-[#eef5ff]';

  return (
    <div className={`min-h-screen ${shellBg} transition-colors duration-200 flex flex-col`}>
      {/* Tricolor top header stripe */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="grid flex-1 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className={`flex min-h-screen flex-col ${mainBg}`}>
          <Topbar />
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
