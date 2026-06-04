import { AppShell } from '@/components/layout/AppShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { Sparkles, PencilLine, Building2, MessageSquareText, ShieldCheck, Landmark, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const aiSteps = [
  {
    title: 'Categorize Issue',
    description: 'Our system identifies the exact category of the reported grievance (e.g. Potholes, Water Leakage, Electricity).',
    icon: PencilLine,
    tone: 'green',
  },
  {
    title: 'Assign Department',
    description: 'AI automatically determines the correct administrative department responsible for action, sorting geographic vs non-geographic flows.',
    icon: Building2,
    tone: 'blue',
  },
  {
    title: 'Generate Complaint',
    description: 'Translates informal citizen inputs into formal, structured, and actionable official requests suitable for government reviewers.',
    icon: MessageSquareText,
    tone: 'purple',
  },
] as const;

export function HowItWorksPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <SectionCard title="How CivicEye AI Works" description="Understanding the intelligence pipeline connecting citizens to administration.">
          <div className="p-6 rounded-3xl border border-civic-line bg-civic-surfaceSoft space-y-4">
            <div className="flex items-center gap-3 text-civic-primary">
              <Sparkles className="h-6 w-6 animate-pulse" />
              <h2 className="text-xl font-bold">The Hybrid AI Routing Architecture</h2>
            </div>
            <p className="text-sm leading-relaxed text-civic-muted">
              CivicEye AI uses a secure single-ingestion AI model. When a citizen submits a complaint, the description is processed immediately to categorize, route, and rewrite the grievance. This information is saved permanently, allowing scalable duplicate detection and clustering without repeating expensive LLM calls.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {aiSteps.map((step, index) => {
              const Icon = step.icon;
              const toneClass =
                step.tone === 'green'
                  ? 'bg-civic-accentSoft text-civic-success'
                  : step.tone === 'blue'
                    ? 'bg-civic-infoSoft text-civic-primary'
                    : 'bg-purple-100 text-purple-600';

              return (
                <div key={step.title} className="flex gap-5 items-start p-5 rounded-2xl border border-civic-line bg-white">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${toneClass} shadow-sm`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-civic-text">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-civic-muted">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6">
            <h3 className="text-lg font-bold text-civic-text mb-4">Core Principles</h3>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-civic-text">
                  <ShieldCheck className="h-4 w-4 text-civic-success" />
                  Transparency
                </div>
                <p className="text-xs text-civic-muted">Citizens track their grievance status, department assignments, and timeline in real-time.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-civic-text">
                  <Landmark className="h-4 w-4 text-civic-primary" />
                  Accountability
                </div>
                <p className="text-xs text-civic-muted">Monitors average resolution time and rankings across government departments to prevent delays.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-civic-text">
                  <Clock className="h-4 w-4 text-civic-warning" />
                  Efficiency
                </div>
                <p className="text-xs text-civic-muted">Clustering groups duplicate complaints to reduce noise, letting officials focus on hotspots.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Link
              to="/"
              className="rounded-full border border-civic-line bg-white px-5 py-2.5 text-sm font-semibold text-civic-text hover:bg-civic-surfaceSoft transition"
            >
              Back to Home
            </Link>
            <Link
              to="/citizen"
              className="rounded-full bg-civic-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-civic-primaryDark transition flex items-center gap-2"
            >
              File a Complaint
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
