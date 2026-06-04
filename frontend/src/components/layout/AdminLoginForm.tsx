import { useState, type FormEvent } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { citizenLogin } from '@/services/api/auth';

type AdminLoginFormProps = {
  onLoginSuccess: () => void;
};

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await citizenLogin({ email, password });
      if (response.citizen?.role === 'admin') {
        localStorage.setItem('civiceye_admin_token', response.access_token);
        localStorage.setItem('civiceye_admin_user', JSON.stringify(response.citizen));
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setError('Unauthorized access. This account does not have administrator privileges.');
        setIsLoading(false);
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Invalid admin credentials. Please use official admin credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#f8fafc] px-4 py-12 text-slate-900 overflow-hidden">
      {/* Tricolor top header stripe */}
      <div className="absolute top-0 left-0 h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute right-0 top-52 h-72 w-72 rounded-full bg-teal-50/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft backdrop-blur sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-[#0a2240] shadow-sm mb-4 border border-slate-200">
            <Landmark className="h-8 w-8 text-[#FF9933]" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0a2240]">Admin Console</h2>
          <p className="mt-2 text-sm text-slate-500">Ministry Administration & Redressal Redirection</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Admin Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="surekhanallakantham@gmail.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1d5fe0] focus:bg-white"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Security Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1d5fe0] focus:bg-white"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0a2240] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#071930] hover:scale-[1.01] disabled:opacity-60"
          >
            {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Use official credentials: <br />
          <span className="font-mono text-slate-700 font-semibold">surekhanallakantham@gmail.com</span> / <span className="font-mono text-slate-700 font-semibold">surekha@123</span>
        </div>
      </div>
    </div>
  );
}
