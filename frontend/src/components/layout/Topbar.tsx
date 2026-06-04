import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = ['/admin', '/clusters', '/analytics', '/department'].some((path) =>
    location.pathname.startsWith(path)
  );

  const [citizen, setCitizen] = useState<{ name: string; email: string } | null>(null);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Read citizen details
    const storedCitizen = localStorage.getItem('civiceye_user');
    if (storedCitizen) {
      try {
        setCitizen(JSON.parse(storedCitizen));
      } catch (e) {}
    }

    // Read admin details
    const storedAdmin = localStorage.getItem('civiceye_admin_user');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {}
    }
  }, [location.pathname]);

  const handleCitizenLogout = () => {
    localStorage.removeItem('civiceye_token');
    localStorage.removeItem('civiceye_user');
    setCitizen(null);
    navigate('/');
    window.location.reload();
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('civiceye_admin_token');
    localStorage.removeItem('civiceye_admin_user');
    setAdmin(null);
    navigate('/');
    window.location.reload();
  };

  // Styling based on role path
  const headerBg = isAdminPath ? 'bg-white border-slate-200' : 'bg-white border-civic-line';
  const textTitle = isAdminPath ? 'text-[#0a2240]' : 'text-[#0a192f]';
  const textMuted = isAdminPath ? 'text-slate-500' : 'text-civic-muted';

  return (
    <header className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 backdrop-blur ${headerBg} transition-colors duration-200`}>
      <div>
        <p className={`text-[10px] uppercase tracking-[0.28em] font-bold ${textMuted}`}>CivicEye AI redressal platform</p>
        <h2 className={`text-lg font-bold ${textTitle}`}>
          {isAdminPath ? 'Departmental Control Center' : 'Citizen Grievance Workspace'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {isAdminPath ? (
          admin ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#1e3a8a] bg-[#dbeafe] border border-[#bfdbfe] px-3 py-1.5 rounded-full">
                Admin: {admin.name}
              </span>
              <button
                onClick={handleAdminLogout}
                className="border border-slate-200 bg-white text-xs font-semibold px-4 py-1.5 rounded-full text-slate-700 hover:bg-slate-50 transition"
              >
                Exit Console
              </button>
            </div>
          ) : null
        ) : citizen ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-civic-text bg-civic-surfaceSoft border border-civic-line px-3 py-1.5 rounded-full">
              Citizen: {citizen.name}
            </span>
            <Link
              to="/my-complaints"
              className="border border-civic-line bg-civic-surface text-xs font-semibold px-4 py-1.5 rounded-full text-civic-text hover:bg-civic-surfaceSoft transition"
            >
              My Complaints
            </Link>
            <button
              onClick={handleCitizenLogout}
              className="border border-civic-line bg-civic-surface text-xs font-semibold px-4 py-1.5 rounded-full text-civic-text hover:bg-civic-surfaceSoft transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-civic-primary px-5 py-2 text-sm font-semibold text-white hover:bg-civic-primaryDark transition shadow-sm"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
