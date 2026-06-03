import { useState } from 'react';
import { trackComplaint, trackComplaintTimeline } from '@/services/api/complaints';
import { SectionCard } from '@/components/ui/SectionCard';
import { Clock, CheckCircle2, AlertCircle, Building, Calendar, Info } from 'lucide-react';

type TimelineEvent = {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  note: string;
  changed_at: string;
};

type ComplaintData = {
  id: string;
  complaint_code: string;
  name: string;
  phone?: string;
  description: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  status: string;
  category?: string;
  department?: string;
  severity?: string;
  ai_confidence?: number;
  ai_summary?: string;
  generated_complaint?: string;
  submitted_at: string;
};

const STAGES = [
  { key: 'submitted', label: 'Submitted', desc: 'Complaint registered in platform' },
  { key: 'ai_categorized', label: 'AI Categorized', desc: 'Complaint auto-analyzed by LLM' },
  { key: 'assigned', label: 'Assigned', desc: 'Complaint routed to appropriate department' },
  { key: 'under_review', label: 'Under Review', desc: 'Officials are verifying the complaint details' },
  { key: 'in_progress', label: 'In Progress', desc: 'Department working to resolve the issue' },
  { key: 'resolved', label: 'Resolved', desc: 'Resolution completed' },
  { key: 'feedback_received', label: 'Citizen Feedback', desc: 'Grievance feedback submitted by user' },
];

export function ComplaintTracking() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError('');
    setComplaint(null);
    setTimeline([]);

    try {
      const compData = await trackComplaint(code.trim());
      setComplaint(compData);

      const timelineData = await trackComplaintTimeline(code.trim());
      setTimeline(timelineData.timeline || []);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Complaint not found. Verify the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStageStatus = (stageKey: string) => {
    if (!complaint) return 'pending';
    
    const currentStatus = complaint.status.toLowerCase();
    const statusOrder = STAGES.map(s => s.key);
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stageIndex = statusOrder.indexOf(stageKey);

    if (currentStatus === 'rejected') {
      return stageKey === 'submitted' ? 'completed' : 'rejected';
    }

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <SectionCard title="Track Complaint" description="View real-time complaint progress and automated AI re-routing details.">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          placeholder="Enter complaint code e.g. CIV-171800000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          className="w-full rounded-2xl border border-civic-line bg-civic-panelSoft px-4 py-3 text-civic-text outline-none placeholder:text-civic-muted/60 focus:border-civic-primary"
        />
        <button
          onClick={handleTrack}
          disabled={isLoading}
          className="rounded-2xl bg-civic-primary hover:bg-civic-primaryDark px-6 py-3 font-semibold text-white transition disabled:opacity-60"
        >
          {isLoading ? 'Searching...' : 'Track'}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {complaint && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6 space-y-4">
              <h3 className="text-lg font-semibold text-civic-text">Grievance Information</h3>
              <hr className="border-civic-line" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Citizen Name</span>
                  <span className="font-medium text-civic-text">{complaint.name}</span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Submitted On</span>
                  <span className="font-medium text-civic-text">
                    {new Date(complaint.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Description</span>
                  <span className="text-civic-text leading-relaxed">{complaint.description}</span>
                </div>
                {complaint.generated_complaint && (
                  <div className="col-span-2 bg-white border border-civic-line p-4 rounded-2xl">
                    <span className="text-civic-muted block text-xs uppercase tracking-wider mb-1">AI Official Version</span>
                    <span className="text-civic-text italic">"{complaint.generated_complaint}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6 space-y-4">
              <h3 className="text-lg font-semibold text-civic-text">Resolution Details</h3>
              <hr className="border-civic-line" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Category</span>
                  <span className="font-medium text-civic-text">{complaint.category || 'Categorizing...'}</span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Assigned Department</span>
                  <span className="font-medium text-civic-text">{complaint.department || 'Pending Routing'}</span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Severity</span>
                  <span className="font-medium text-civic-text capitalize">{complaint.severity || 'Medium'}</span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Status</span>
                  <span className="font-semibold text-civic-primary uppercase">{complaint.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6">
            <h3 className="text-lg font-semibold text-civic-text mb-6">Complaint Progress Timeline</h3>
            <div className="relative border-l border-civic-line ml-4 space-y-8 pb-4">
              {STAGES.map((stage) => {
                const status = getStageStatus(stage.key);
                let badgeColor = 'bg-white border-civic-line text-civic-muted';
                let textColor = 'text-civic-muted';

                if (status === 'completed') {
                  badgeColor = 'bg-civic-accent text-white border-civic-accent';
                  textColor = 'text-civic-text';
                } else if (status === 'active') {
                  badgeColor = 'bg-civic-primary text-white border-civic-primary ring-4 ring-civic-infoSoft';
                  textColor = 'text-civic-text font-semibold';
                } else if (status === 'rejected') {
                  badgeColor = 'bg-red-500 text-white border-red-500';
                  textColor = 'text-red-600';
                }

                // Check for updates matching this status key in history
                const matches = timeline.filter(event => {
                  const normalizedStatus = event.new_status.toLowerCase();
                  return normalizedStatus === stage.key || 
                         (stage.key === 'feedback_received' && normalizedStatus === 'feedback_received');
                });

                return (
                  <div key={stage.key} className="relative pl-8">
                    <div className={`absolute -left-3.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 ${badgeColor}`}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-base ${textColor}`}>{stage.label}</h4>
                      <p className="mt-1 text-sm text-civic-muted">{stage.desc}</p>
                      
                      {matches.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {matches.map(m => (
                            <div key={m.id} className="bg-white/80 rounded-xl p-3 border border-civic-line text-xs text-civic-muted space-y-1">
                              <div className="flex items-center gap-1 text-civic-text font-medium">
                                <Info className="h-3.5 w-3.5 text-civic-primary" />
                                <span>{m.note}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] pt-1">
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" /> By: {m.changed_by}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {new Date(m.changed_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
