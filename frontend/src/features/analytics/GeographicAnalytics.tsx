import { useState, useEffect, useRef } from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { getHeatmapData, type HeatmapPoint } from '@/services/api/analytics';
import { updateComplaintStatus } from '@/services/api/departments';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Sparkles, Filter, ShieldAlert, RotateCcw } from 'lucide-react';

// Overriding default Leaflet marker icon configuration due to bundler renaming issues
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

export function GeographicAnalytics() {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [viewMode, setViewMode] = useState<'heatmap' | 'pins'>('heatmap');

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);

  // Active right-side panel tab
  const [activeRightTab, setActiveRightTab] = useState<'hotspots' | 'grievances'>('hotspots');
  
  // Selected grievance reference for list highlight
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Selected grievance for details modal
  const [selectedModalComplaint, setSelectedModalComplaint] = useState<HeatmapPoint | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Map element refs for pure Leaflet (solving react-leaflet React 19 incompatibilities)
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  
  // Ref mapping from complaint id to leaflet marker/circle layer
  const markerRefs = useRef<Record<string, L.Layer>>({});

  const loadData = async () => {
    try {
      const data = await getHeatmapData();
      setPoints(data || []);
      setFilteredPoints(data || []);
    } catch (e) {
      console.error('Failed to fetch heatmap coordinates:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch heatmap points
  useEffect(() => {
    loadData();

    // Listen to WebSocket events to reload in real-time
    window.addEventListener('ws-complaint_created', loadData);
    window.addEventListener('ws-complaint_updated', loadData);
    return () => {
      window.removeEventListener('ws-complaint_created', loadData);
      window.removeEventListener('ws-complaint_updated', loadData);
    };
  }, []);

  // Compute unique lists for options
  const uniqueStates = Array.from(new Set(points.map(p => p.state).filter(Boolean))).sort();
  const uniqueCities = Array.from(
    new Set(
      points
        .filter(p => !selectedState || p.state === selectedState)
        .map(p => p.city)
        .filter(Boolean)
    )
  ).sort();

  // Apply filters and calculate center
  useEffect(() => {
    let result = [...points];

    if (selectedState) {
      result = result.filter(p => p.state === selectedState);
    }
    if (selectedCity) {
      result = result.filter(p => p.city === selectedCity);
    }
    if (selectedSeverity) {
      result = result.filter(p => p.severity.toLowerCase() === selectedSeverity.toLowerCase());
    }

    setFilteredPoints(result);

    // Pan map to center of selected city or state
    if (selectedCity && result.length > 0) {
      const lats = result.map(p => p.latitude);
      const lons = result.map(p => p.longitude);
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLon = lons.reduce((a, b) => a + b, 0) / lons.length;
      setMapCenter([avgLat, avgLon]);
      setMapZoom(12);
      setActiveRightTab('grievances'); // Auto-switch to grievance list when filtering specifically
    } else if (selectedState && result.length > 0) {
      const lats = result.map(p => p.latitude);
      const lons = result.map(p => p.longitude);
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLon = lons.reduce((a, b) => a + b, 0) / lons.length;
      setMapCenter([avgLat, avgLon]);
      setMapZoom(7);
      setActiveRightTab('grievances'); // Auto-switch to grievance list when filtering specifically
    } else {
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  }, [selectedState, selectedCity, selectedSeverity, points]);

  // Map initialization effect
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet map instance directly on DOM container
    const map = L.map(mapContainerRef.current).setView(mapCenter, mapZoom);
    mapInstanceRef.current = map;

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Layer group to hold map markers/circles
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Effect to update map viewport (center/zoom) dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(mapCenter, mapZoom);
    }
  }, [mapCenter, mapZoom]);

  // Effect to synchronize points and views onto the map group
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear previous layers and references
    markersGroup.clearLayers();
    markerRefs.current = {};

    filteredPoints.forEach(p => {
      let layer: L.Layer;
      if (viewMode === 'heatmap') {
        const { radius, fillOpacity } = getHeatmapOptions(p.severity);
        layer = L.circleMarker([p.latitude, p.longitude], {
          radius,
          fillColor: getSeverityColor(p.severity),
          fillOpacity,
          stroke: false
        });
      } else {
        layer = L.marker([p.latitude, p.longitude]);
      }

      const popupContent = `
        <div class="text-xs font-sans leading-relaxed p-1">
          <div class="flex items-center justify-between gap-4 border-b pb-1.5 mb-1.5">
            <strong class="font-mono text-[#0a2240]">${p.complaint_code}</strong> 
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" style="background-color: ${getSeverityColor(p.severity)}20; color: ${getSeverityColor(p.severity)}">
              ${p.severity}
            </span>
          </div>
          <div class="font-semibold text-slate-700">${p.category}</div>
          <div class="text-slate-500 max-w-[200px] line-clamp-2 mt-0.5">${p.description}</div>
          <div class="mt-1.5 text-[10px] font-medium text-slate-400 flex justify-between gap-4">
            <span>${p.city}, ${p.state}</span>
            <span class="font-bold text-[#1d5fe0]">${p.status}</span>
          </div>
        </div>
      `;
      layer.bindPopup(popupContent);
      layer.addTo(markersGroup);

      // Save layer reference for programmatically opening popup
      markerRefs.current[p.id] = layer;

      // When clicking marker directly on map, highlight it in the list and switch tab
      layer.on('click', () => {
        setSelectedComplaintId(p.id);
        setActiveRightTab('grievances');
      });
    });
  }, [filteredPoints, viewMode]);

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedSeverity('');
    setSelectedComplaintId(null);
  };

  // Helper to scale Heatmap circles by severity
  const getHeatmapOptions = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return { radius: 20, fillOpacity: 0.7 };
      case 'high':
        return { radius: 16, fillOpacity: 0.55 };
      case 'medium':
        return { radius: 12, fillOpacity: 0.45 };
      case 'low':
        return { radius: 8, fillOpacity: 0.35 };
      default:
        return { radius: 12, fillOpacity: 0.45 };
    }
  };

  // Get color by severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#ef4444'; // Red
      case 'high':
        return '#f97316'; // Orange
      case 'medium':
        return '#eab308'; // Yellow
      case 'low':
        return '#22c55e'; // Green
      default:
        return '#3b82f6';
    }
  };

  // Handle list selection click
  const handleSelectComplaint = (p: HeatmapPoint) => {
    setSelectedComplaintId(p.id);
    setMapCenter([p.latitude, p.longitude]);
    setMapZoom(14);
    
    // Defer popup trigger to let Leaflet's viewport pan complete
    setTimeout(() => {
      const layer = markerRefs.current[p.id];
      if (layer) {
        layer.openPopup();
      }
    }, 150);
  };

  // Sort complaints from high to low priority
  const severityOrder: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  const sortedComplaints = [...filteredPoints].sort((a, b) => {
    const aOrd = severityOrder[a.severity.toLowerCase()] || 0;
    const bOrd = severityOrder[b.severity.toLowerCase()] || 0;
    return bOrd - aOrd;
  });

  // Calculate dynamic hotspots for side panel
  const cityCounts: Record<string, number> = {};
  filteredPoints.forEach(p => {
    if (p.city) {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    }
  });
  const hotspotsList = Object.entries(cityCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const criticalCount = filteredPoints.filter(p => p.severity === 'critical').length;
  const highCount = filteredPoints.filter(p => p.severity === 'high').length;
  const overallCount = filteredPoints.length;
  const uniqueCitiesCount = new Set(filteredPoints.map(p => p.city)).size;

  return (
    <div className="space-y-6">
      {/* Stat indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Mapped Grievances" value={overallCount} />
        <StatCard label="Critical Severity" value={criticalCount} tone={criticalCount > 0 ? 'danger' : 'default'} />
        <StatCard label="High Severity" value={highCount} tone={highCount > 0 ? 'warning' : 'default'} />
        <StatCard label="Affected Cities" value={uniqueCitiesCount} tone="accent" />
      </div>

      {/* Filter panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#0a2240] font-bold text-sm">
            <Filter className="h-4.5 w-4.5" />
            <span>Interactive Map Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* State filter */}
            <select
              value={selectedState}
              onChange={e => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1d5fe0] focus:bg-white"
            >
              <option value="">All States (Overall)</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {/* City filter */}
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1d5fe0] focus:bg-white"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Severity filter */}
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1d5fe0] focus:bg-white"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Reset button */}
            {(selectedState || selectedCity || selectedSeverity) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1.4fr]">
        {/* Map column */}
        <SectionCard
          title="Spatial Redressal Heatmap"
          description="Visual cluster intensity overlays representing reported civic complaints."
          className="overflow-hidden"
        >
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                Showing <strong>{filteredPoints.length}</strong> complaints
              </span>
              <div className="h-4 w-px bg-slate-200" />
              {/* Severity Legend */}
              <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Critical
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#f97316]" /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#eab308]" /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Low
                </span>
              </div>
            </div>
            
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('heatmap')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-[#0a2240] shadow-sm border border-slate-250/20'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Heatmap Mode
              </button>
              <button
                onClick={() => setViewMode('pins')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  viewMode === 'pins'
                    ? 'bg-white text-[#0a2240] shadow-sm border border-slate-250/20'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Complaint Pins
              </button>
            </div>
          </div>

          <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-200 z-0">
            {/* Direct DOM Map Container for pure Leaflet JS */}
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </div>
        </SectionCard>

        {/* Right Tabbed Panel: Hotspots vs Grievances Registry */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft flex flex-col min-h-[500px]">
          {/* Tab Selection buttons */}
          <div className="flex border-b border-slate-100 pb-3 mb-4 gap-2">
            <button
              onClick={() => setActiveRightTab('hotspots')}
              className={`flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                activeRightTab === 'hotspots'
                  ? 'bg-[#eff6ff] text-[#1d5fe0] border border-blue-100'
                  : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-transparent'
              }`}
            >
              Municipal Hotspots
            </button>
            <button
              onClick={() => setActiveRightTab('grievances')}
              className={`flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'grievances'
                  ? 'bg-[#eff6ff] text-[#1d5fe0] border border-blue-100'
                  : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-transparent'
              }`}
            >
              Grievances Registry
              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                {filteredPoints.length}
              </span>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {activeRightTab === 'hotspots' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0a2240]">Active Hotspot Summary</h3>
                  <p className="text-xs text-slate-400">Top geographic target municipal zones requiring redressal allocation.</p>
                </div>
                {hotspotsList.length === 0 ? (
                  <div className="flex h-60 flex-col items-center justify-center text-slate-400 text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <ShieldAlert className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm font-semibold">No hotspots found in the selected region.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 text-sm">
                      {hotspotsList.map((hotspot, idx) => {
                        const maxCount = hotspotsList[0]?.count || 1;
                        const pct = Math.round((hotspot.count / maxCount) * 100);
                        return (
                          <div
                            key={hotspot.location}
                            className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#eff6ff] text-xs font-bold text-[#1d5fe0] border border-blue-50">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-[#0a2240]">{hotspot.location}</span>
                              </div>
                              <span className="rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700 font-mono">
                                {hotspot.count} Grievances
                              </span>
                            </div>

                            <div className="w-full">
                              <div className="h-2 w-full rounded-full bg-slate-150 overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-[#dfeaff] bg-[#eff6ff]/40 p-4 text-xs text-slate-600 flex items-start gap-2 mt-4">
                      <MapPin className="h-4.5 w-4.5 text-[#1d5fe0] shrink-0 mt-0.5 animate-bounce" />
                      <p className="leading-relaxed">
                        <strong>AI Resource Recommendation:</strong> Distribute emergency redressal inspector crew to{' '}
                        <strong>{hotspotsList[0]?.location || 'Top Cities'}</strong> to address critical density hotspots.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-[#0a2240]">Grievances Registry</h3>
                  <p className="text-xs text-slate-400">All filtered complaints sorted from highest severity to lowest.</p>
                </div>
                
                {sortedComplaints.length === 0 ? (
                  <div className="flex h-60 flex-col items-center justify-center text-slate-400 text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 justify-center flex-1">
                    <ShieldAlert className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm font-semibold">No complaints match the current filters.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {sortedComplaints.map(p => {
                      const isSelected = selectedComplaintId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectComplaint(p)}
                          className={`rounded-2xl p-4 border text-left cursor-pointer transition-all hover:shadow ${
                            isSelected
                              ? 'bg-blue-50/40 border-[#1d5fe0] ring-1 ring-[#1d5fe0]/30 shadow-sm'
                              : 'bg-[#f8fafc] border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-[#0a2240]">
                              {p.complaint_code}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: `${getSeverityColor(p.severity)}15`,
                                color: getSeverityColor(p.severity),
                                border: `1px solid ${getSeverityColor(p.severity)}30`
                              }}
                            >
                              {p.severity}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-700 mb-1">{p.category}</div>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">{p.description}</p>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/60">
                            <span className="text-[10px] text-slate-400">{p.city}, {p.state}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid map centering
                                setSelectedModalComplaint(p);
                              }}
                              className="rounded-lg bg-[#eff6ff] hover:bg-[#dfeaff] border border-blue-100 px-2.5 py-1 text-[11px] font-bold text-[#1d5fe0] transition-all"
                            >
                              See Complaint
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Details Modal Popup */}
      {selectedModalComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 animate-in fade-in zoom-in duration-200">
            {/* Saffron/Tricolor top border line */}
            <div className="absolute top-0 left-0 h-1.5 w-full flex">
              <div className="h-full w-1/3 bg-[#FF9933]"></div>
              <div className="h-full w-1/3 bg-white"></div>
              <div className="h-full w-1/3 bg-[#138808]"></div>
            </div>

            {/* Close Cross Button */}
            <button
              onClick={() => setSelectedModalComplaint(null)}
              className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 mt-2">
                <span className="font-mono text-lg font-bold text-[#0a2240]">{selectedModalComplaint.complaint_code}</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${getSeverityColor(selectedModalComplaint.severity)}15`,
                    color: getSeverityColor(selectedModalComplaint.severity),
                    border: `1px solid ${getSeverityColor(selectedModalComplaint.severity)}30`
                  }}
                >
                  {selectedModalComplaint.severity}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Left info column */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citizen Filer</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedModalComplaint.citizen_name || 'Anonymous'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grievance Category</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedModalComplaint.category}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location Address</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-150 max-h-24 overflow-y-auto font-medium">
                      {selectedModalComplaint.city}, {selectedModalComplaint.state}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Redressal Status</span>
                    <select
                      value={selectedModalComplaint.status}
                      disabled={isUpdatingStatus}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        setIsUpdatingStatus(true);
                        try {
                          await updateComplaintStatus(
                            selectedModalComplaint.id,
                            newStatus,
                            'Status updated via spatial redressal heatmap console'
                          );
                          // Update local list state dynamically
                          setPoints(prev => prev.map(p => p.id === selectedModalComplaint.id ? { ...p, status: newStatus } : p));
                          setFilteredPoints(prev => prev.map(p => p.id === selectedModalComplaint.id ? { ...p, status: newStatus } : p));
                          setSelectedModalComplaint(prev => prev ? { ...prev, status: newStatus } : null);
                        } catch (err) {
                          console.error('Failed to update status:', err);
                        } finally {
                          setIsUpdatingStatus(false);
                        }
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#1d5fe0] disabled:opacity-50"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="ai_categorized">AI Categorized</option>
                      <option value="assigned">Assigned</option>
                      <option value="under_review">Under Review</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="feedback_received">Feedback Received</option>
                      <option value="rejected">Rejected</option>
                      <option value="escalated">Escalated</option>
                    </select>
                    <span className="block text-[9px] text-slate-400 leading-normal">
                      Changing status triggers WebSocket broadcasts to instantly update citizen views.
                    </span>
                  </div>
                </div>

                {/* Right description column */}
                <div className="flex flex-col">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grievance Description</span>
                  <p className="flex-1 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto leading-relaxed whitespace-pre-line font-medium">
                    {selectedModalComplaint.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedModalComplaint(null)}
                className="rounded-full bg-[#0a2240] hover:bg-[#071930] px-6 py-2.5 text-xs font-bold text-white transition shadow"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
