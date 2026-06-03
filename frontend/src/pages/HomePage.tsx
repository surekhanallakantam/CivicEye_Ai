import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeInfo,
  Building2,
  ChevronDown,
  Clock3,
  CircleCheckBig,
  Globe2,
  Home,
  ImageUp,
  LayoutList,
  Landmark,
  Mail,
  MapPin,
  MessageSquareText,
  PencilLine,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  User2,
} from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/', icon: Home, active: true },
  { label: 'My Complaints', to: '/citizen', icon: LayoutList, active: false },
  { label: 'Track Complaint', to: '/track', icon: Clock3, active: false },
] as const;

const aiSteps = [
  {
    title: 'Categorize Issue',
    description: 'AI will identify the type of civic issue.',
    icon: PencilLine,
    tone: 'green',
  },
  {
    title: 'Assign Department',
    description: 'AI will route the complaint to the correct department.',
    icon: Building2,
    tone: 'blue',
  },
  {
    title: 'Generate Complaint',
    description: 'AI will generate a formal complaint for tracking.',
    icon: MessageSquareText,
    tone: 'purple',
  },
] as const;

const trackingStages = [
  {
    label: 'Submitted',
    note: 'Your complaint has been submitted',
    status: 'Completed',
    tone: 'green',
    active: true,
  },
  {
    label: 'Assigned',
    note: 'Complaint assigned to relevant department',
    status: 'In Progress',
    tone: 'blue',
    active: true,
  },
  {
    label: 'In Progress',
    note: 'Department is working on the issue',
    status: 'Pending',
    tone: 'gray',
    active: false,
  },
  {
    label: 'Resolved',
    note: 'Issue resolved successfully',
    status: 'Pending',
    tone: 'gray',
    active: false,
  },
] as const;

const benefitCards = [
  { title: 'Transparent Process', description: 'Track every step of your complaint', icon: ShieldCheck },
  { title: 'Timely Updates', description: 'Get real-time updates on progress', icon: Clock3 },
  { title: 'Accountability', description: 'Departments are bound to respond', icon: Landmark },
  { title: 'Better Communities', description: "Together, let's build better cities", icon: Sparkles },
] as const;

export function HomePage() {
  return (
    <div id="top" className="relative min-h-screen w-full overflow-hidden bg-civic-page text-civic-text">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-civic-primary/10 blur-3xl" />
        <div className="absolute right-0 top-52 h-72 w-72 rounded-full bg-civic-info/10 blur-3xl" />
        <div className="absolute left-0 top-[32rem] h-64 w-64 rounded-full bg-civic-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] bg-home-hero px-5 py-4 text-white shadow-soft sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-glow backdrop-blur">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight">CivicEye AI</div>
                <div className="mt-1 text-sm text-white/85">Report civic issues in minutes</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm text-white/95 backdrop-blur">
                <Building2 className="h-4 w-4" />
                <span className="text-right font-medium leading-tight">Smart Cities<br />Better India</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-4 rounded-[1.6rem] border border-civic-line bg-civic-surface/95 px-4 py-3 shadow-soft backdrop-blur sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    item.active
                      ? 'bg-civic-infoSoft text-civic-primary shadow-sm'
                      : 'text-civic-muted hover:bg-civic-surfaceSoft hover:text-civic-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-civic-line bg-civic-surface px-4 py-2 text-sm font-medium text-civic-text shadow-sm transition hover:bg-civic-surfaceSoft">
              <Globe2 className="h-4 w-4 text-civic-muted" />
              English
              <ChevronDown className="h-4 w-4 text-civic-muted" />
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-civic-line bg-civic-surface px-4 py-2 text-sm font-medium text-civic-text shadow-sm transition hover:bg-civic-surfaceSoft"
            >
              <User2 className="h-4 w-4 text-civic-muted" />
              Login
            </Link>
          </div>
        </div>

        <main className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section id="complaint-form" className="rounded-[1.8rem] border border-civic-line bg-civic-surface/95 p-5 shadow-soft backdrop-blur sm:p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-civic-infoSoft text-civic-primary">
                <PencilLine className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-civic-text sm:text-[2rem]">Submit a Complaint</h1>
                <p className="mt-1 text-sm text-civic-muted">Help us improve your city. Fill in the details below.</p>
              </div>
            </div>

            <form className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Full Name" icon={User2} placeholder="Enter your full name" required />
                <Field label="Phone Number" icon={Mail} placeholder="Enter phone number" required />
              </div>

              <TextAreaField
                label="Problem Description"
                placeholder="Describe the issue in detail..."
                helper="Please provide as much detail as possible"
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <SelectField label="State" icon={MapPin} placeholder="Select State" />
                <SelectField label="City" icon={Building2} placeholder="Select City" />
              </div>

              <Field label="Address" icon={MapPin} placeholder="Enter exact address of the issue" required />
              <Field label="Pincode" icon={LayoutList} placeholder="Enter pincode" required />

              <UploadCard />

              <Link
                to="/citizen"
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-civic-primary to-civic-accent px-6 py-4 text-base font-semibold text-white shadow-glow transition hover:scale-[1.01] hover:brightness-105"
              >
                <Send className="h-5 w-5" />
                Submit Complaint
              </Link>

              <div className="flex items-center justify-center gap-2 text-sm text-civic-muted">
                <ShieldCheck className="h-4 w-4 text-civic-success" />
                Your information is secure and will not be shared.
              </div>
            </form>
          </section>

          <aside className="rounded-[1.8rem] border border-civic-line bg-civic-surface/95 p-5 shadow-soft backdrop-blur sm:p-6">
            <div className="flex items-center gap-3 text-civic-success">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">AI Live Preview</h2>
            </div>
            <p className="mt-3 max-w-md text-sm leading-7 text-civic-text/80">
              Our AI will analyze your complaint and take the following actions:
            </p>

            <div className="mt-8 space-y-5">
              {aiSteps.map((step, index) => {
                const Icon = step.icon;
                const toneClass =
                  step.tone === 'green'
                    ? 'bg-civic-accentSoft text-civic-success'
                    : step.tone === 'blue'
                      ? 'bg-civic-infoSoft text-civic-primary'
                      : 'bg-purple-100 text-purple-600';

                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${toneClass} shadow-sm`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      {index < aiSteps.length - 1 ? <div className="mt-2 h-10 w-px border-l-2 border-dashed border-civic-line" /> : null}
                    </div>

                    <div className="pt-1">
                      <div className="text-lg font-semibold text-civic-text">
                        {index + 1}. {step.title}
                      </div>
                      <p className="mt-1 max-w-sm text-sm leading-7 text-civic-text/75">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-civic-success/20 bg-civic-accentSoft p-4 text-sm text-civic-success shadow-sm">
              This ensures faster resolution and accountability.
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-civic-line bg-gradient-to-b from-slate-50 to-slate-100/70 p-5">
              <div className="flex items-center justify-between gap-4 text-civic-text">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-civic-muted">Smart City Support</p>
                  <h3 className="mt-2 text-2xl font-semibold">Built for civic visibility</h3>
                </div>
                <CircleCheckBig className="h-9 w-9 text-civic-success" />
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div className="space-y-2 text-sm text-civic-muted">
                  <div>AI categorization</div>
                  <div>Department routing</div>
                  <div>Complaint generation</div>
                </div>
                <div className="flex h-24 w-32 items-end justify-center gap-3 rounded-3xl bg-gradient-to-b from-civic-infoSoft to-white p-4">
                  <div className="h-8 w-8 rounded-full bg-civic-primary/25" />
                  <div className="h-12 w-8 rounded-full bg-civic-primary/35" />
                  <div className="h-16 w-8 rounded-full bg-civic-primary/45" />
                </div>
              </div>
            </div>
          </aside>
        </main>

        <section id="tracking" className="mt-6 rounded-[1.8rem] border border-civic-line bg-civic-surface/95 p-5 shadow-soft backdrop-blur sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 text-civic-primary">
                <Clock3 className="h-6 w-6" />
                <h2 className="text-2xl font-semibold text-civic-text">Complaint Tracking</h2>
              </div>
              <p className="mt-1 text-sm text-civic-muted">Track the status of your complaint in real-time.</p>
            </div>
            <button className="inline-flex items-center gap-2 self-start rounded-full border border-civic-line bg-civic-surface px-4 py-2 text-sm font-medium text-civic-text transition hover:bg-civic-surfaceSoft sm:self-auto">
              View All Complaints
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-4">
            {trackingStages.map((stage, index) => (
              <TrackingStep key={stage.label} stage={stage} index={index} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[1.6rem] border border-civic-line bg-civic-surface/95 p-4 shadow-soft backdrop-blur sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {benefitCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-civic-line bg-civic-surfaceSoft p-4">
                  <div className="rounded-2xl bg-civic-infoSoft p-3 text-civic-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-civic-text">{item.title}</div>
                    <div className="mt-1 text-sm text-civic-muted">{item.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-6 rounded-[1.6rem] bg-home-hero px-5 py-4 text-white shadow-soft">
          <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span>© 2025 CivicEye AI. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Use
              </a>
              <a href="#" className="hover:text-white">
                Contact Us
              </a>
            </div>
          </div>
        </footer>

        <section id="faq" className="sr-only">
          FAQs placeholder section
        </section>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  icon: typeof User2;
  placeholder: string;
  required?: boolean;
};

function Field({ label, icon: Icon, placeholder, required }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-civic-text">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
        <input
          placeholder={placeholder}
          className="w-full rounded-2xl border border-civic-line bg-civic-surface px-4 py-3 pl-11 text-civic-text outline-none transition placeholder:text-civic-muted/55 focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft"
        />
      </div>
    </label>
  );
}

function SelectField({ label, icon: Icon, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-civic-text">
        {label} <span className="text-red-500">*</span>
      </span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
        <select className="w-full appearance-none rounded-2xl border border-civic-line bg-civic-surface px-4 py-3 pl-11 pr-11 text-civic-text outline-none transition focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft">
          <option>{placeholder}</option>
          <option>Andhra Pradesh</option>
          <option>Telangana</option>
          <option>Karnataka</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
      </div>
    </label>
  );
}

function TextAreaField({ label, placeholder, helper }: { label: string; placeholder: string; helper: string }) {
  const count = 0;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-civic-text">
        {label} <span className="text-red-500">*</span>
      </span>
      <textarea
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-2xl border border-civic-line bg-civic-surface px-4 py-3 text-civic-text outline-none transition placeholder:text-civic-muted/55 focus:border-civic-primary focus:ring-4 focus:ring-civic-infoSoft"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-civic-muted">
        <span>{helper}</span>
        <span>{count} / 1000</span>
      </div>
    </label>
  );
}

function UploadCard() {
  return (
    <div>
      <div className="mb-2 block text-sm font-semibold text-civic-text">
        Upload Image <span className="font-normal text-civic-muted">(optional)</span>
      </div>
      <div className="grid gap-4 rounded-2xl border border-dashed border-civic-line bg-civic-surfaceSoft p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-civic-infoSoft p-3 text-civic-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-civic-text">Click to upload or drag and drop</div>
            <div className="mt-1 text-xs text-civic-muted">JPG, PNG up to 5MB</div>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-civic-infoSoft to-white text-civic-primary">
            <ImageUp className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingStep({ stage, index }: { stage: (typeof trackingStages)[number]; index: number }) {
  const isActive = stage.active;
  const chipClass =
    stage.tone === 'green'
      ? 'bg-civic-accentSoft text-civic-success border-civic-success/20'
      : stage.tone === 'blue'
        ? 'bg-civic-infoSoft text-civic-primary border-civic-primary/20'
        : 'bg-civic-surfaceSoft text-civic-muted border-civic-line';

  return (
    <div className="rounded-[1.4rem] border border-civic-line bg-civic-surfaceSoft p-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft ring-8 ring-civic-infoSoft/50">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${isActive ? 'bg-civic-primary' : 'bg-slate-300'}`}>
          {index === 0 ? <CircleCheckBig className="h-8 w-8" /> : index === 1 ? <User2 className="h-7 w-7" /> : <Clock3 className="h-7 w-7" />}
        </div>
      </div>
      <div className="mt-4 text-base font-semibold text-civic-text">{stage.label}</div>
      <p className="mt-2 text-sm leading-6 text-civic-muted">{stage.note}</p>
      <div className={`mx-auto mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${chipClass}`}>
        {stage.status}
      </div>
    </div>
  );
}
