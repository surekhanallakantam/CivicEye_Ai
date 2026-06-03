import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { citizenRegister } from '@/services/api/auth';
import { ShieldCheck, User2, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await citizenRegister({ name, email, password, phone });
      localStorage.setItem('civiceye_token', response.access_token);
      localStorage.setItem('civiceye_user', JSON.stringify(response.citizen));
      navigate('/');
      window.location.reload();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-civic-page px-4 py-12 text-civic-text overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-civic-primary/10 blur-3xl" />
        <div className="absolute right-0 top-52 h-72 w-72 rounded-full bg-civic-info/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-[2rem] border border-civic-line bg-white p-8 shadow-soft backdrop-blur sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-civic-infoSoft text-civic-primary shadow-sm mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">Citizen Register</h2>
          <p className="mt-2 text-sm text-civic-muted">Create a secure profile to manage complaints</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-civic-text">Full Name</span>
            <div className="relative">
              <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-civic-line bg-civic-page px-4 py-3 pl-11 text-civic-text outline-none transition placeholder:text-civic-muted/50 focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-civic-text">Email Address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-civic-line bg-civic-page px-4 py-3 pl-11 text-civic-text outline-none transition placeholder:text-civic-muted/50 focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-civic-text">Phone Number</span>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-2xl border border-civic-line bg-civic-page px-4 py-3 pl-11 text-civic-text outline-none transition placeholder:text-civic-muted/50 focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-civic-text">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-civic-line bg-civic-page px-4 py-3 pl-11 text-civic-text outline-none transition placeholder:text-civic-muted/50 focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-civic-primary to-civic-info px-6 py-4 text-base font-semibold text-white shadow-glow transition hover:scale-[1.01] hover:brightness-105 disabled:opacity-60"
          >
            {isLoading ? 'Registering...' : 'Register'}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-civic-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-civic-primary hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
