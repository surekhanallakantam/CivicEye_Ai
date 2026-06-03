import { useState, useEffect, type FormEvent } from 'react';
import { submitComplaint, type ComplaintCreatePayload } from '@/services/api/complaints';
import { SectionCard } from '@/components/ui/SectionCard';
import { Sparkles, CheckCircle, Clock } from 'lucide-react';

const initialState: ComplaintCreatePayload = {
  name: '',
  phone: '',
  description: '',
  state: '',
  city: '',
  address: '',
  pincode: '',
};

type AIResultDetails = {
  complaint_code: string;
  category: string;
  department: string;
  severity: string;
  ai_confidence: number;
  ai_summary: string;
  generated_complaint: string;
};

export function ComplaintForm() {
  const [form, setForm] = useState<ComplaintCreatePayload>(initialState);
  const [status, setStatus] = useState<string>('Ready to submit complaint');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIResultDetails | null>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('civiceye_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setForm((prev) => ({
          ...prev,
          name: user.name || '',
          phone: user.phone_number || '',
        }));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const update = (key: keyof ComplaintCreatePayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('Submitting complaint to backend. Executing AI analysis...');
    setAiResult(null);

    try {
      const response = await submitComplaint(form);
      setStatus(`Submitted successfully. Complaint code: ${response.complaint_code}`);
      setAiResult({
        complaint_code: response.complaint_code,
        category: response.category || 'Categorizing...',
        department: response.department || 'Routing...',
        severity: response.severity || 'Medium',
        ai_confidence: response.ai_confidence || 85,
        ai_summary: response.ai_summary || 'Summary generating...',
        generated_complaint: response.generated_complaint || '',
      });
      
      // Clear form description but keep profile details
      setForm((prev) => ({
        ...prev,
        description: '',
        address: '',
        pincode: '',
      }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (aiResult) {
    return (
      <div className="space-y-6">
        <SectionCard title="Complaint Submitted Successfully" description="Your grievance has been received and processed by our AI system.">
          <div className="rounded-3xl border border-civic-accent/20 bg-civic-accentSoft/30 p-6 flex flex-col md:flex-row items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-civic-accent text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-civic-text">Complaint Code: {aiResult.complaint_code}</h3>
              <p className="mt-1 text-sm text-civic-muted">Use this code on the tracking portal to monitor updates.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6 space-y-4">
              <div className="flex items-center gap-2 text-civic-primary">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <h4 className="font-semibold">AI Routing Decision</h4>
              </div>
              <hr className="border-civic-line" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Detected Category</span>
                  <span className="font-medium text-civic-text">{aiResult.category}</span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Routed Department</span>
                  <span className="font-medium text-civic-text">{aiResult.department}</span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">Severity Level</span>
                  <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs inline-block ${
                    aiResult.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    aiResult.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    aiResult.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {aiResult.severity}
                  </span>
                </div>
                <div>
                  <span className="text-civic-muted block text-xs uppercase tracking-wider">AI Confidence Score</span>
                  <span className="font-medium text-civic-text">{aiResult.ai_confidence}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6 space-y-4">
              <div className="flex items-center gap-2 text-civic-text">
                <Clock className="h-5 w-5 text-civic-muted" />
                <h4 className="font-semibold">Official Grievance Copy</h4>
              </div>
              <hr className="border-civic-line" />
              <p className="text-sm italic leading-relaxed text-civic-muted bg-white p-4 rounded-2xl border border-civic-line">
                "{aiResult.generated_complaint}"
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                setAiResult(null);
                setStatus('Ready to submit complaint');
              }}
              className="rounded-full bg-civic-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-civic-primaryDark"
            >
              Raise Another Complaint
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <SectionCard title="Citizen Complaint Form" description="Collect citizen details, location, and description before AI analysis.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Name" value={form.name} onChange={(value) => update('name', value)} required />
        <Input label="Phone Number" value={form.phone || ''} onChange={(value) => update('phone', value)} />
        <Input label="State" value={form.state} onChange={(value) => update('state', value)} required />
        <Input label="City" value={form.city} onChange={(value) => update('city', value)} required />
        <Input label="Address" value={form.address} onChange={(value) => update('address', value)} className="md:col-span-2" required />
        <Input label="Pincode" value={form.pincode} onChange={(value) => update('pincode', value)} required />
        <TextArea label="Problem Description" value={form.description} onChange={(value) => update('description', value)} className="md:col-span-2" required />

        <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-civic-line bg-civic-panelSoft p-4">
          <p className="text-sm text-civic-muted">{status}</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-civic-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
};

function Input({ label, value, onChange, className, required }: FieldProps) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm text-civic-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-2xl border border-civic-line bg-civic-panelSoft px-4 py-3 text-civic-text outline-none transition placeholder:text-civic-muted/60 focus:border-civic-accent"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, className, required }: FieldProps) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm text-civic-muted">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={5}
        className="w-full rounded-2xl border border-civic-line bg-civic-panelSoft px-4 py-3 text-civic-text outline-none transition placeholder:text-civic-muted/60 focus:border-civic-accent"
      />
    </label>
  );
}
