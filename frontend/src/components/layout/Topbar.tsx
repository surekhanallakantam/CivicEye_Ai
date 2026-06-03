import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function Topbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('civiceye_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('civiceye_token');
    localStorage.removeItem('civiceye_user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-civic-line bg-white/70 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-civic-muted">CivicEye AI</p>
        <h2 className="text-xl font-semibold text-civic-text">Citizen grievance intelligence platform</h2>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-civic-text">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-civic-line bg-civic-surface px-4 py-1.5 text-xs font-semibold text-civic-text hover:bg-civic-surfaceSoft transition"
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
