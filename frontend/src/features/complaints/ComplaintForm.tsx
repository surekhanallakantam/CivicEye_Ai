import { useState, useEffect, useRef, type FormEvent } from 'react';
import { submitComplaint, type ComplaintCreatePayload } from '@/services/api/complaints';
import { SectionCard } from '@/components/ui/SectionCard';
import { Sparkles, CheckCircle, Clock, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const initialState: ComplaintCreatePayload = {
  name: '',
  phone: '',
  description: '',
  state: '',
  city: '',
  address: '',
  pincode: '',
  latitude: undefined,
  longitude: undefined
};

const STATE_CITIES: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Nellore',
    'Kurnool',
    'Tirupati',
    'Kakinada',
    'Rajamahendravaram',
    'Kadapa',
    'Anantapur',
  ],
  'Telangana': [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Khammam',
    'Karimnagar',
    'Ramagundam',
    'Mahabubnagar',
    'Nalgonda',
    'Adilabad',
    'Suryapet',
  ],
};

const CITY_CENTERS: Record<string, [number, number]> = {
  'Visakhapatnam': [17.6868, 83.2185],
  'Vijayawada': [16.5062, 80.6480],
  'Guntur': [16.3067, 80.4365],
  'Nellore': [14.4426, 79.9865],
  'Kurnool': [15.8281, 78.0373],
  'Tirupati': [13.6288, 79.4192],
  'Kakinada': [16.9891, 82.2475],
  'Rajamahendravaram': [17.0007, 81.7778],
  'Kadapa': [14.4712, 78.8243],
  'Anantapur': [14.6819, 77.6006],
  'Hyderabad': [17.3850, 78.4867],
  'Warangal': [17.9689, 79.5941],
  'Nizamabad': [18.6725, 78.0941],
  'Khammam': [17.2473, 80.1514],
  'Karimnagar': [18.4386, 79.1288],
  'Ramagundam': [18.8038, 79.4495],
  'Mahabubnagar': [16.7320, 77.9897],
  'Nalgonda': [17.0575, 79.2684],
  'Adilabad': [19.6641, 78.5320],
  'Suryapet': [17.1500, 79.6160]
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

  // Map elements ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

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

  // Map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center at Hyderabad
    const defaultCenter: [number, number] = [17.3850, 78.4867];
    const map = L.map(mapContainerRef.current).setView(defaultCenter, 8);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Click handler for coordinates pinning
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      handleMapClick(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [aiResult]); // Recreate map when view changes from AI Results back to Form

  // Dynamic map panning and pre-pinning on manual city selection
  useEffect(() => {
    const city = form.city;
    if (city && CITY_CENTERS[city] && mapInstanceRef.current) {
      const coords = CITY_CENTERS[city];
      mapInstanceRef.current.setView(coords, 12);

      // Place pin at center if not placed yet
      if (!form.latitude || !form.longitude) {
        if (markerRef.current) {
          markerRef.current.setLatLng(coords);
        } else {
          markerRef.current = L.marker(coords).addTo(mapInstanceRef.current);
        }
        setForm((prev) => ({
          ...prev,
          latitude: coords[0],
          longitude: coords[1]
        }));
      }
    }
  }, [form.city]);

  const handleMapClick = async (lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Update marker placement
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }

    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

    // Reverse geocode address
    setStatus('Reverse geocoding coordinates to resolve address details...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'CivicEye-AI-Application' } }
      );

      if (!response.ok) throw new Error('Reverse geocoding request failed');

      const data = await response.json();
      const addr = data.address || {};
      const displayName = data.display_name || '';
      const postcode = addr.postcode || '';
      
      const state = addr.state || '';
      const city = addr.city || addr.town || addr.village || addr.suburb || '';

      // Match state to supported options
      let matchedState = '';
      if (state.toLowerCase().includes('andhra') || state.toLowerCase().includes('pradesh')) {
        matchedState = 'Andhra Pradesh';
      } else if (state.toLowerCase().includes('telangana')) {
        matchedState = 'Telangana';
      }

      // Match city to allowed list
      let matchedCity = '';
      if (matchedState) {
        const allowedCities = STATE_CITIES[matchedState] || [];
        const cleanCity = city.trim().toLowerCase();
        const found = allowedCities.find(c => c.toLowerCase() === cleanCity);
        if (found) {
          matchedCity = found;
        } else {
          const foundSub = allowedCities.find(c => cleanCity.includes(c.toLowerCase()) || c.toLowerCase().includes(cleanCity));
          if (foundSub) {
            matchedCity = foundSub;
          }
        }
      }

      setForm((prev) => ({
        ...prev,
        state: matchedState || prev.state,
        city: matchedCity || prev.city,
        address: displayName || prev.address,
        pincode: postcode || prev.pincode
      }));

      setStatus('Location pinned and address auto-filled successfully.');
    } catch (e) {
      console.error('Reverse geocoding failed:', e);
      setStatus('Location pinned. Geocoding failed, please fill in address details manually.');
    }
  };

  const update = (key: keyof ComplaintCreatePayload, value: any) => {
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
        category: response.category,
        department: response.department,
        severity: response.severity,
        ai_confidence: response.ai_confidence,
        ai_summary: response.ai_summary,
        generated_complaint: response.generated_complaint,
      });
      
      // Clear form inputs
      setForm((prev) => ({
        ...prev,
        description: '',
        address: '',
        pincode: '',
        latitude: undefined,
        longitude: undefined
      }));
      markerRef.current = null;
      
      // Notify other parts of the application
      window.dispatchEvent(new Event('complaint-submitted'));
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
              </div>
            </div>

            <div className="rounded-3xl border border-civic-line bg-civic-surfaceSoft p-6 space-y-4">
              <div className="flex items-center gap-2 text-civic-text">
                <Clock className="h-5 w-5 text-civic-muted" />
                <h4 className="font-semibold">Official Grievance Copy</h4>
              </div>
              <hr className="border-civic-line" />
              <p className="text-sm italic leading-relaxed text-civic-muted bg-white p-4 rounded-2xl border border-civic-line whitespace-pre-line">
                {aiResult.generated_complaint}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                setAiResult(null);
                setStatus('Ready to submit complaint');
                setForm((prev) => ({
                  ...prev,
                  name: prev.name,
                  phone: prev.phone,
                  description: '',
                  state: '',
                  city: '',
                  address: '',
                  pincode: '',
                  latitude: undefined,
                  longitude: undefined
                }));
                markerRef.current = null;
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
        <SelectState label="State" value={form.state} onChange={(value) => {
          update('state', value);
          update('city', ''); // reset city
        }} required />
        <SelectCity label="City" state={form.state} value={form.city} onChange={(value) => update('city', value)} required />

        {/* Interactive Map Selection */}
        <div className="md:col-span-2 space-y-2">
          <span className="block text-sm text-civic-muted flex items-center gap-1.5 font-semibold">
            <MapPin className="h-4 w-4 text-civic-accent" />
            Pin Grievance Location on Map (Auto-fills Address)
          </span>
          <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-civic-line z-0">
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </div>
          <span className="block text-[11px] text-civic-muted/80 leading-normal">
            Click anywhere on the map to set a precise location pin. This automatically resolves your State, City, Address, and Pincode using reverse geocoding, while letting you make manual edits below.
          </span>
        </div>

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

function SelectState({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-civic-muted">{label} {required && <span className="text-red-500">*</span>}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-2xl border border-civic-line bg-civic-panelSoft px-4 py-3 text-civic-text outline-none transition focus:border-civic-accent"
      >
        <option value="">Select State</option>
        <option value="Andhra Pradesh">Andhra Pradesh</option>
        <option value="Telangana">Telangana</option>
      </select>
    </label>
  );
}

function SelectCity({ label, state, value, onChange, required }: { label: string; state: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const cities = STATE_CITIES[state] || [];
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-civic-muted">{label} {required && <span className="text-red-500">*</span>}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={!state}
        className="w-full rounded-2xl border border-civic-line bg-civic-panelSoft px-4 py-3 text-civic-text outline-none transition focus:border-civic-accent disabled:opacity-50"
      >
        <option value="">Select City</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </label>
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
      <span className="mb-2 block text-sm text-civic-muted">{label} {required && <span className="text-red-500">*</span>}</span>
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
      <span className="mb-2 block text-sm text-civic-muted">{label} {required && <span className="text-red-500">*</span>}</span>
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
