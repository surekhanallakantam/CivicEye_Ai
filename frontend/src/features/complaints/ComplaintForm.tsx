import { useState, type FormEvent } from 'react';
import { submitComplaint, type ComplaintCreatePayload } from '@/services/api/complaints';
import { SectionCard } from '@/components/ui/SectionCard';

const initialState: ComplaintCreatePayload = {
  name: '',
  phone: '',
  description: '',
  state: '',
  city: '',
  address: '',
  pincode: '',
  image_url: '',
};

export function ComplaintForm() {
  const [form, setForm] = useState<ComplaintCreatePayload>(initialState);
  const [status, setStatus] = useState<string>('Ready to submit complaint');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof ComplaintCreatePayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('Submitting complaint to backend...');
    try {
      const response = await submitComplaint(form);
      setStatus(`Submitted successfully. Complaint code: ${response.complaint_code}`);
      setForm(initialState);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionCard title="Citizen Complaint Form" description="Collect citizen details, location, and optional image before AI analysis.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Name" value={form.name} onChange={(value) => update('name', value)} required />
        <Input label="Phone Number" value={form.phone || ''} onChange={(value) => update('phone', value)} />
        <Input label="State" value={form.state} onChange={(value) => update('state', value)} required />
        <Input label="City" value={form.city} onChange={(value) => update('city', value)} required />
        <Input label="Address" value={form.address} onChange={(value) => update('address', value)} className="md:col-span-2" required />
        <Input label="Pincode" value={form.pincode} onChange={(value) => update('pincode', value)} required />
        <Input label="Image URL (optional)" value={form.image_url || ''} onChange={(value) => update('image_url', value)} className="md:col-span-2" />
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
