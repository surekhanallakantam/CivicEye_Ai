import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Clock3,
  CircleCheckBig,
  Globe2,
  LayoutList,
  Landmark,
  ShieldCheck,
  Sparkles,
  User2,
  FileText,
  HelpCircle,
  HelpCircleIcon
} from 'lucide-react';

const trackingStages = [
  { label: 'Grievance Registered', desc: 'Submitted by citizen on the portal.' },
  { label: 'AI Auto-Routing', desc: 'Analyzed and categorized to the relevant department.' },
  { label: 'Redressal In-Progress', desc: 'Officials inspect and update resolution steps.' },
  { label: 'Resolved & Closed', desc: 'Completed with citizen feedback.' },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

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
    <div id="top" className="relative min-h-screen w-full bg-[#f4f7fa] text-civic-text font-sans flex flex-col justify-between">
      <div>
        {/* Tricolor top header stripe */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#138808]"></div>
        </div>

        {/* GOI official utility header bar */}
        <div className="w-full bg-[#0a192f] text-slate-300 text-xs px-4 py-1.5 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <span>GOVERNMENT OF INDIA</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">DIGITAL INDIA INITIATIVE</span>
          </div>
          <div className="flex items-center gap-3">
            <span>English</span>
            <span>|</span>
            <a href="#main-content" className="hover:text-white transition">Skip to Main Content</a>
          </div>
        </div>

        {/* Ministry title & crest block */}
        <div className="w-full bg-white border-b border-civic-line py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a192f] to-[#122e54] text-white">
                <Landmark className="h-8 w-8 text-[#FF9933]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#0a192f]">CIVIC EYE AI</h1>
                <p className="text-[10px] text-civic-muted uppercase tracking-widest font-semibold mt-0.5">
                  National Public Grievance Portal & Departmental Redressal System
                </p>
              </div>
            </div>

            {/* User Session links */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-civic-text bg-civic-surfaceSoft border border-civic-line px-3 py-1.5 rounded-full">
                    Welcome, {user.name}
                  </span>
                  <Link
                    to="/my-complaints"
                    className="bg-white hover:bg-civic-surfaceSoft text-[#122e54] border border-[#122e54] text-xs font-semibold px-4 py-2 rounded-full transition shadow-sm"
                  >
                    My Complaints
                  </Link>
                  <Link
                    to="/citizen"
                    className="bg-[#122e54] hover:bg-[#0a192f] text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow-sm"
                  >
                    Citizen Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="border border-civic-line bg-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-civic-surfaceSoft transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="bg-[#122e54] hover:bg-[#0a192f] text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="border border-civic-line bg-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-civic-surfaceSoft transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#122e54] to-[#1d4c82] rounded-[1.6rem] p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
              <Landmark className="h-96 w-96" />
            </div>
            <div className="relative max-w-3xl space-y-4">
              <span className="bg-[#FF9933] text-slate-900 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                Official Redressal Portal
              </span>
              <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight">
                Centralized Public Grievance Redress & Monitoring System
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-200">
                CivicEye AI is a digital platform linking citizens to local and national government departments. File public service or infrastructure grievances online, auto-routed instantly to relevant desk administrators.
              </p>
              
              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  to={user ? "/citizen" : "/login"}
                  className="bg-[#FF9933] hover:bg-[#e0862b] text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  File Grievance / Register Complaint
                </Link>
                <Link
                  to="/track"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-2xl text-sm transition flex items-center gap-2"
                >
                  <Clock3 className="h-4 w-4 text-civic-accent" />
                  Track Grievance Status
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-3xl border border-civic-line p-5 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-orange-100 text-[#FF9933]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0a192f]">10 Core</div>
                <div className="text-xs text-civic-muted font-medium mt-0.5">Departments Integrated</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-civic-line p-5 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-green-100 text-civic-success">
                <CircleCheckBig className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0a192f]">Resolved</div>
                <div className="text-xs text-civic-muted font-medium mt-0.5">Transparent Citizen Audit</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-civic-line p-5 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-blue-100 text-civic-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0a192f]">AI Routed</div>
                <div className="text-xs text-civic-muted font-medium mt-0.5">Zero Human Despatch Overhead</div>
              </div>
            </div>
          </div>

          {/* How It Works (Integrated directly) */}
          <div className="bg-white rounded-[1.6rem] border border-civic-line p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#0a192f]">How It Works</h3>
              <p className="text-sm text-civic-muted mt-1">Simple 4-stage processing flow for citizens grievances.</p>
            </div>
            <hr className="border-civic-line" />

            <div className="grid gap-6 md:grid-cols-4">
              {trackingStages.map((stage, index) => (
                <div key={stage.label} className="relative p-5 rounded-2xl border border-civic-line bg-civic-surfaceSoft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF9933] bg-[#FF9933]/10 px-2.5 py-0.5 rounded-full">
                      Stage {index + 1}
                    </span>
                    <span className="text-xs font-mono text-civic-muted">0{index + 1}</span>
                  </div>
                  <h4 className="font-bold text-[#0a192f] text-base">{stage.label}</h4>
                  <p className="text-xs leading-relaxed text-civic-muted">{stage.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-civic-infoSoft text-civic-primary text-xs flex items-center gap-2 border border-civic-primary/10">
              <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-[#FF9933]" />
              <span><strong>AI Core Routing Decision:</strong> The system automatically extracts category, severity, and responsible officer departments from complaint text. Zero manual dispatch errors.</span>
            </div>
          </div>

          {/* Benefits Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-[1.6rem] border border-civic-line p-6 flex gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-orange-100 text-[#FF9933]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-[#0a192f]">Geographic Redressal</h4>
                <p className="text-xs leading-relaxed text-civic-muted">Issues with spatial coordinates (roads, garbage, electricity, water pipelines) are routed to department desks mapping real-time cluster coordinates.</p>
              </div>
            </div>
            <div className="bg-white rounded-[1.6rem] border border-civic-line p-6 flex gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-green-100 text-[#138808]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-[#0a192f]">Non-Geographic Processing</h4>
                <p className="text-xs leading-relaxed text-civic-muted">Department files (pensions, scholarship delays, farmer subsidies, insurance) are processed via administrative registries and monthly trend reports.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Official Government style Footer */}
      <footer className="w-full bg-[#0a192f] text-slate-400 text-xs mt-12 border-t-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white tracking-wide uppercase">CivicEye AI redressal platform</h4>
              <p className="leading-relaxed max-w-sm">
                Designed and maintained in compliance with the Guidelines for Indian Government Websites (GIGW). Centralized Redressal and Citizen Transparency monitoring.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="space-y-2">
                <h5 className="font-semibold text-white uppercase">Portal Links</h5>
                <ul className="space-y-1.5">
                  <li><Link to="/citizen" className="hover:text-white">File Complaint</Link></li>
                  <li><Link to="/my-complaints" className="hover:text-white">My Complaints</Link></li>
                  <li><Link to="/track" className="hover:text-white">Track Grievance</Link></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-white uppercase">Policy Links</h5>
                <ul className="space-y-1.5">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Use</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px]">
            <span>© 2026 National Informatics Centre (NIC) / Ministry of Electronics & IT.</span>
            <span>Last Updated: June 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
