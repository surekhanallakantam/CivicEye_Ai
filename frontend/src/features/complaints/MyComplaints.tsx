import { useState, useEffect } from 'react';
import { getMyComplaints } from '@/services/api/complaints';
import { SectionCard } from '@/components/ui/SectionCard';
import { FileText, Clipboard, ExternalLink, Calendar, Search, Sparkles } from 'lucide-react';

type Complaint = {
  id: string;
  complaint_code: string;
  name: string;
  description: string;
  status: string;
  submitted_at: string;
  category?: string;
  department?: string;
  severity?: string;
  ai_summary?: string;
};

export function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMyComplaints();
        setComplaints(data || []);
      } catch (e) {
        console.error('Failed to load user complaints:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Listen for custom submit event and websocket events to automatically refresh list
    window.addEventListener('complaint-submitted', loadData);
    window.addEventListener('ws-complaint_created', loadData);
    window.addEventListener('ws-complaint_updated', loadData);
    return () => {
      window.removeEventListener('complaint-submitted', loadData);
      window.removeEventListener('ws-complaint_created', loadData);
      window.removeEventListener('ws-complaint_updated', loadData);
    };
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ai_categorized': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'assigned': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'under_review': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filtered = complaints.filter(c => {
    const term = search.toLowerCase();
    return c.complaint_code.toLowerCase().includes(term) ||
           c.description.toLowerCase().includes(term) ||
           (c.category && c.category.toLowerCase().includes(term)) ||
           (c.department && c.department.toLowerCase().includes(term));
  });

  if (isLoading) {
    return (
      <SectionCard title="My Grievances" description="Loading your filed complaints...">
        <div className="flex h-40 items-center justify-center text-civic-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-civic-primary border-t-transparent" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="My Grievances" description="List of all civic issues submitted under your citizen profile.">
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-civic-muted" />
        <input
          type="text"
          placeholder="Filter by code, category, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-civic-line bg-civic-surface px-4 py-3 pl-11 text-civic-text outline-none focus:border-civic-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-civic-line p-10 text-center text-civic-muted">
          <FileText className="mx-auto h-12 w-12 opacity-40 mb-3" />
          <p className="text-base font-semibold">No complaints found</p>
          <p className="text-sm mt-1">If you have civic issues to report, click 'Raise Complaint' in the sidebar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-5 hover:shadow-sm transition">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-civic-text">{c.complaint_code}</span>
                    <button
                      onClick={() => handleCopy(c.complaint_code)}
                      className="text-civic-muted hover:text-civic-primary transition"
                      title="Copy code"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                    {copiedCode === c.complaint_code && (
                      <span className="text-[10px] bg-civic-accentSoft text-civic-success px-2 py-0.5 rounded-full">Copied!</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-civic-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Filed on {new Date(c.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(c.status)}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm text-civic-text leading-relaxed">{c.description}</p>
                
                {c.ai_summary && (
                  <div className="flex items-start gap-2 bg-white/70 border border-civic-line rounded-2xl p-3 text-xs text-civic-muted">
                    <Sparkles className="h-4 w-4 text-civic-primary shrink-0 mt-0.5 animate-pulse" />
                    <span><strong>AI Summary:</strong> {c.ai_summary}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-civic-muted pt-2 border-t border-civic-line/50">
                  {c.category && (
                    <span><strong>Category:</strong> {c.category}</span>
                  )}
                  {c.department && (
                    <span><strong>Routed To:</strong> {c.department}</span>
                  )}
                  {c.severity && (
                    <span><strong>Severity:</strong> <span className="capitalize">{c.severity}</span></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
