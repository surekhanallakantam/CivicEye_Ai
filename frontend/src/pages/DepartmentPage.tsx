import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import {
  getDepartments,
  getDepartmentComplaints,
  getDepartmentClusters,
  runDepartmentClustering,
  updateComplaintStatus,
  type DepartmentStats,
  type DepartmentComplaint,
  type DepartmentCluster
} from '@/services/api/departments';
import {
  Building2,
  MapPin,
  Droplet,
  Trash2,
  Zap,
  Coins,
  TrendingUp,
  GraduationCap,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  Search,
  Sparkles,
  Phone,
  FileText,
  AlertCircle,
  Layers3,
  Users
} from 'lucide-react';

const DEPT_ICONS: Record<string, any> = {
  roads: MapPin,
  drainage: Droplet,
  garbage: Trash2,
  water: Droplet,
  electricity: Zap,
  pension: Coins,
  agriculture: TrendingUp,
  revenue: Building2,
  scholarship: GraduationCap,
  insurance: ShieldAlert,
};

export function DepartmentPage() {
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentStats | null>(null);
  const [complaints, setComplaints] = useState<DepartmentComplaint[]>([]);
  const [clusters, setClusters] = useState<DepartmentCluster[]>([]);
  
  const [activeTab, setActiveTab] = useState<'all' | 'clustered'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isComplaintsLoading, setIsComplaintsLoading] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [selectedComplaint, setSelectedComplaint] = useState<DepartmentComplaint | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<DepartmentCluster | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Load departments
  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await getDepartments();
        setDepartments(data || []);
      } catch (e) {
        console.error('Failed to fetch departments:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDepts();
  }, []);

  // WebSocket real-time updates for department workspace
  useEffect(() => {
    const handleWsEvent = async () => {
      if (!selectedDept) {
        try {
          const data = await getDepartments();
          setDepartments(data || []);
        } catch (e) {
          console.error('Failed to reload departments list:', e);
        }
      } else {
        try {
          const complaintsData = await getDepartmentComplaints(selectedDept.id);
          setComplaints(complaintsData || []);
          
          const clustersData = await getDepartmentClusters(selectedDept.id);
          setClusters(clustersData || []);
          
          if (selectedComplaint) {
            const updatedComp = complaintsData.find(c => c.id === selectedComplaint.id);
            if (updatedComp) {
              setSelectedComplaint(updatedComp);
            }
          }
        } catch (e) {
          console.error('Failed to reload department workspace:', e);
        }
      }
    };

    window.addEventListener('ws-complaint_created', handleWsEvent);
    window.addEventListener('ws-complaint_updated', handleWsEvent);
    return () => {
      window.removeEventListener('ws-complaint_created', handleWsEvent);
      window.removeEventListener('ws-complaint_updated', handleWsEvent);
    };
  }, [selectedDept, selectedComplaint]);

  // Load complaints & clusters for selected department
  const handleSelectDept = async (dept: DepartmentStats) => {
    setSelectedDept(dept);
    setIsComplaintsLoading(true);
    setSelectedComplaint(null);
    setSelectedCluster(null);
    setActiveTab('all');
    try {
      const complaintsData = await getDepartmentComplaints(dept.id);
      setComplaints(complaintsData || []);
      
      const clustersData = await getDepartmentClusters(dept.id);
      setClusters(clustersData || []);
    } catch (e) {
      console.error('Failed to fetch complaints/clusters for department:', e);
    } finally {
      setIsComplaintsLoading(false);
    }
  };

  const handleBackToDepts = async () => {
    setSelectedDept(null);
    setComplaints([]);
    setClusters([]);
    setSelectedComplaint(null);
    setSelectedCluster(null);
    setActiveTab('all');
    setIsLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data || []);
    } catch (e) {
      console.error('Failed to refresh departments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunClustering = async () => {
    if (!selectedDept) return;
    setIsClustering(true);
    setSuccessMsg('');
    try {
      const newClusters = await runDepartmentClustering(selectedDept.id);
      setClusters(newClusters || []);
      setSuccessMsg(`AI clustering completed. ${newClusters.length} clusters resolved and saved to database.`);
      setTimeout(() => setSuccessMsg(''), 5000);
      
      // Re-fetch complaints in case details were synchronized
      const complaintsData = await getDepartmentComplaints(selectedDept.id);
      setComplaints(complaintsData || []);
      
      setSelectedComplaint(null);
      setSelectedCluster(null);
      setActiveTab('clustered');
    } catch (e) {
      console.error('Failed to run AI clustering:', e);
    } finally {
      setIsClustering(false);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setUpdatingId(complaintId);
    setSuccessMsg('');
    try {
      await updateComplaintStatus(complaintId, newStatus, `Status updated via Admin Department Control Center`);
      // Update local state
      setComplaints(prev =>
        prev.map(c => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setSuccessMsg('Status updated successfully in the database.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status mapping colors for govt look
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let bg = 'bg-slate-100 text-slate-800 border-slate-200';
    if (s === 'submitted') bg = 'bg-blue-50 text-blue-700 border-blue-200';
    else if (s === 'ai_categorized') bg = 'bg-purple-50 text-purple-700 border-purple-200';
    else if (s === 'assigned') bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    else if (s === 'under_review') bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    else if (s === 'in_progress') bg = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (s === 'resolved') bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (s === 'rejected') bg = 'bg-rose-50 text-rose-700 border-rose-200';
    else if (s === 'escalated') bg = 'bg-red-50 text-red-700 border-red-200';

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${bg}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Severity color mapping
  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    const s = severity.toLowerCase();
    let bg = 'bg-slate-100 text-slate-800';
    if (s === 'critical') bg = 'bg-red-100 text-red-800 font-bold';
    else if (s === 'high') bg = 'bg-orange-100 text-orange-800 font-semibold';
    else if (s === 'medium') bg = 'bg-amber-100 text-amber-800';
    else if (s === 'low') bg = 'bg-green-100 text-green-800';

    return (
      <span className={`px-2 py-0.5 rounded text-[11px] uppercase ${bg}`}>
        {severity}
      </span>
    );
  };

  // Filter raw complaints for Tab 1
  const filteredComplaints = complaints.filter(c => {
    const term = search.toLowerCase();
    return (
      c.complaint_code.toLowerCase().includes(term) ||
      c.citizen_name.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      (c.category && c.category.toLowerCase().includes(term))
    );
  });

  // Consolidated items list for Tab 2
  const clusteredComplaintIds = new Set(clusters.flatMap(c => c.complaint_ids));
  
  type ConsolidatedItem = 
    | { type: 'cluster'; cluster: DepartmentCluster }
    | { type: 'complaint'; complaint: DepartmentComplaint };
    
  const consolidatedItems: ConsolidatedItem[] = [];
  
  // Add all clusters
  clusters.forEach(cluster => {
    consolidatedItems.push({ type: 'cluster', cluster });
  });
  
  // Add complaints not belonging to any cluster
  complaints.forEach(complaint => {
    if (!clusteredComplaintIds.has(complaint.id)) {
      consolidatedItems.push({ type: 'complaint', complaint });
    }
  });

  // Apply search/filters to consolidated items
  const filteredConsolidated = consolidatedItems.filter(item => {
    const term = search.toLowerCase();
    if (item.type === 'cluster') {
      return (
        item.cluster.cluster_code.toLowerCase().includes(term) ||
        item.cluster.cluster_name.toLowerCase().includes(term) ||
        (item.cluster.city && item.cluster.city.toLowerCase().includes(term))
      );
    } else {
      return (
        item.complaint.complaint_code.toLowerCase().includes(term) ||
        item.complaint.citizen_name.toLowerCase().includes(term) ||
        item.complaint.description.toLowerCase().includes(term) ||
        (item.complaint.category && item.complaint.category.toLowerCase().includes(term))
      );
    }
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0a2240] border-t-transparent" />
            <span className="text-sm font-semibold">Loading Department Dashboard...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {!selectedDept ? (
        // Department Grid List
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-extrabold text-[#0a2240]">National Redressal & Departmental Grievance Boards</h1>
            <p className="mt-1 text-sm text-slate-500">
              Select an administrative department board below to audit assigned complaints, manage status transitions, and review AI classification logs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const IconComponent = DEPT_ICONS[dept.slug] || Building2;
              const resolutionRate =
                dept.total_complaints > 0
                  ? Math.round((dept.resolved_complaints / dept.total_complaints) * 100)
                  : 0;

              return (
                <div
                  key={dept.id}
                  onClick={() => handleSelectDept(dept)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Top saffron accent line for government look */}
                  <div className="absolute left-0 top-0 h-1.5 w-full bg-[#FF9933]"></div>

                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[#0a2240] border border-slate-100 group-hover:bg-[#eff6ff] group-hover:text-[#1d5fe0] transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase border ${
                        dept.is_geographic
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}
                    >
                      {dept.is_geographic ? 'Geographic' : 'Scheme Level'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-[#0a2240] group-hover:text-[#1d5fe0] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
                      Slug: {dept.slug}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#0a2240]">{dept.total_complaints}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-600">{dept.pending_complaints}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Pending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-600">{dept.resolved_complaints}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Resolved</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Resolution Performance</span>
                      <span className="font-bold text-slate-700">{resolutionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${resolutionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Department Detailed Complaints Workspace
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDepts}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                title="Back to Departments"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-[#0a2240]">{selectedDept.name} Workspace</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Grievance management pool for the {selectedDept.name} board.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunClustering}
                disabled={isClustering || complaints.length < 2}
                className="flex items-center gap-2 rounded-2xl bg-[#0a2240] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#071930] disabled:opacity-55 transition"
              >
                <Sparkles className={`h-4 w-4 text-[#FF9933] ${isClustering ? 'animate-spin' : ''}`} />
                {isClustering ? 'Running AI ML...' : 'Run AI Clustering'}
              </button>
              <span className="text-xs font-mono uppercase bg-slate-100 text-slate-600 px-3 py-2.5 rounded-full border border-slate-200">
                Dept Slug: {selectedDept.slug}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Grievances" value={selectedDept.total_complaints} />
            <StatCard label="Pending Redressals" value={selectedDept.pending_complaints} tone="warning" />
            <StatCard label="Resolved Tickets" value={selectedDept.resolved_complaints} tone="accent" />
            <StatCard
              label="AI Clusters Persisted"
              value={clusters.length}
            />
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            {/* Left/Middle Column - Grievance List Table */}
            <div className="xl:col-span-2 space-y-4">
              <SectionCard
                title="Grievance Workspace"
                description={`Audit and resolve incoming tickets assigned to the ${selectedDept.name}.`}
              >
                {/* Tabs bar */}
                <div className="flex border-b border-slate-200 mb-5">
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      setSelectedComplaint(null);
                      setSelectedCluster(null);
                    }}
                    className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'all'
                        ? 'border-b-[#1d5fe0] text-[#1d5fe0]'
                        : 'border-b-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    All Grievances ({complaints.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('clustered');
                      setSelectedComplaint(null);
                      setSelectedCluster(null);
                    }}
                    className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'clustered'
                        ? 'border-b-[#1d5fe0] text-[#1d5fe0]'
                        : 'border-b-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Clustered View ({filteredConsolidated.length})
                  </button>
                </div>

                <div className="mb-4 relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by code, citizen name, location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#1d5fe0] focus:bg-white transition"
                  />
                </div>

                {isComplaintsLoading ? (
                  <div className="flex h-60 items-center justify-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0a2240] border-t-transparent" />
                      <span>Loading workspace records...</span>
                    </div>
                  </div>
                ) : activeTab === 'all' ? (
                  // Tab 1: All Grievances
                  filteredComplaints.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 bg-slate-50/50">
                      <FileText className="mx-auto h-12 w-12 opacity-30 mb-3" />
                      <p className="text-base font-bold text-slate-700">No grievances found</p>
                      <p className="text-sm mt-1">There are no complaints currently routed to this department matching filters.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                            <th className="p-4">Complaint Code</th>
                            <th className="p-4">Citizen</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredComplaints.map((c) => (
                            <tr
                              key={c.id}
                              onClick={() => {
                                setSelectedComplaint(c);
                                setSelectedCluster(null);
                              }}
                              className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${
                                selectedComplaint?.id === c.id ? 'bg-[#eff6ff]/50' : ''
                              }`}
                            >
                              <td className="p-4 font-mono font-bold text-[#0a2240]">
                                {c.complaint_code}
                              </td>
                              <td className="p-4">
                                <div className="font-semibold">{c.citizen_name}</div>
                                {c.phone_number && (
                                  <div className="text-xs text-slate-400">{c.phone_number}</div>
                                )}
                              </td>
                              <td className="p-4">
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                  {c.category || 'General'}
                                </span>
                              </td>
                              <td className="p-4">
                                {getSeverityBadge(c.severity) || <span className="text-slate-400">-</span>}
                              </td>
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={c.status}
                                  disabled={updatingId === c.id}
                                  onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#1d5fe0] disabled:opacity-55"
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
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedComplaint(c);
                                    setSelectedCluster(null);
                                  }}
                                  className="text-xs font-bold text-[#1d5fe0] hover:underline"
                                >
                                  Audit Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  // Tab 2: Clustered View (Consolidated List)
                  filteredConsolidated.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 bg-slate-50/50">
                      <FileText className="mx-auto h-12 w-12 opacity-30 mb-3" />
                      <p className="text-base font-bold text-slate-700">No consolidated results found</p>
                      <p className="text-sm mt-1">Run AI Clustering to automatically combine duplicate citizen complaints in localized zones.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                            <th className="p-4">Identifier Code</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Filer / Title</th>
                            <th className="p-4">Location Zone</th>
                            <th className="p-4">Size / Priority</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredConsolidated.map((item, idx) => {
                            if (item.type === 'cluster') {
                              const cl = item.cluster;
                              const isSelected = selectedCluster?.id === cl.id;
                              return (
                                <tr
                                  key={`cl-${cl.id}-${idx}`}
                                  onClick={() => {
                                    setSelectedCluster(cl);
                                    setSelectedComplaint(null);
                                  }}
                                  className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${
                                    isSelected ? 'bg-[#fff7ed]/60' : ''
                                  }`}
                                >
                                  <td className="p-4 font-mono font-bold text-amber-700">
                                    {cl.cluster_code}
                                  </td>
                                  <td className="p-4">
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF9933] bg-[#fff7ed] px-2 py-0.5 rounded border border-[#ffedd5] uppercase max-w-fit">
                                      <Layers3 className="h-3 w-3" />
                                      AI Cluster
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-semibold text-slate-800 leading-snug">
                                      {cl.cluster_name}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-xs text-slate-600 font-medium">
                                      {cl.city}, {cl.state}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="flex items-center gap-1 text-[11px] font-bold font-mono text-[#c2410c] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded max-w-fit">
                                      <Users className="h-3 w-3" />
                                      {cl.complaint_ids.length} Reports
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCluster(cl);
                                        setSelectedComplaint(null);
                                      }}
                                      className="text-xs font-bold text-amber-700 hover:underline"
                                    >
                                      Inspect Cluster
                                    </button>
                                  </td>
                                </tr>
                              );
                            } else {
                              const c = item.complaint;
                              const isSelected = selectedComplaint?.id === c.id;
                              return (
                                <tr
                                  key={`comp-${c.id}-${idx}`}
                                  onClick={() => {
                                    setSelectedComplaint(c);
                                    setSelectedCluster(null);
                                  }}
                                  className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${
                                    isSelected ? 'bg-[#eff6ff]/50' : ''
                                  }`}
                                >
                                  <td className="p-4 font-mono font-bold text-[#0a2240]">
                                    {c.complaint_code}
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase max-w-fit">
                                      Individual
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-semibold">{c.citizen_name}</div>
                                    <div className="text-xs text-slate-400 max-w-[200px] truncate">{c.description}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-xs text-slate-500">
                                      {c.city}, {c.state}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    {getSeverityBadge(c.severity) || <span className="text-slate-400">-</span>}
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedComplaint(c);
                                        setSelectedCluster(null);
                                      }}
                                      className="text-xs font-bold text-[#1d5fe0] hover:underline"
                                    >
                                      Audit Details
                                    </button>
                                  </td>
                                </tr>
                              );
                            }
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </SectionCard>
            </div>

            {/* Right Column - Audit Inspector Panel */}
            <div className="space-y-4">
              {selectedCluster ? (
                // Inspector for selected AI Cluster
                <SectionCard title="Cluster Inspector" description="Review automated machine learning grouping intelligence.">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-base font-extrabold text-amber-700">
                          {selectedCluster.cluster_code}
                        </span>
                        <div className="text-xs text-slate-400">
                          Formed: {new Date(selectedCluster.latest_reported_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase border bg-orange-50 text-[#c2410c] border-orange-200">
                        {selectedCluster.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Cluster Location Zone</h4>
                      <div className="rounded-2xl border border-slate-150 bg-[#fff7ed]/20 p-3 text-sm border-amber-100">
                        <div className="font-bold text-[#0a2240]">{selectedCluster.city}, {selectedCluster.state}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Complaints in different cities are strictly segregated and not clustered.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Consolidated Title</h4>
                      <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl p-4 leading-relaxed font-semibold">
                        {selectedCluster.cluster_name}
                      </p>
                    </div>

                    {selectedCluster.ai_summary && (
                      <div className="space-y-2 bg-[#fdf4ff]/70 border border-[#f5d0fe] rounded-2xl p-4">
                        <div className="flex items-start gap-1.5 text-[#a21caf] font-bold text-xs">
                          <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>AI Grouping insight</span>
                        </div>
                        <p className="text-xs text-[#701a75] leading-relaxed mt-1">
                          {selectedCluster.ai_summary}
                        </p>
                        {selectedCluster.root_cause_insight && (
                          <div className="text-[11px] text-[#701a75]/90 border-t border-[#f5d0fe]/60 pt-2 mt-2">
                            <strong>Root Cause Insight:</strong> {selectedCluster.root_cause_insight}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Member Complaints List inside Cluster */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
                        Grouped Citizen Filings ({selectedCluster.complaint_ids.length})
                      </h4>
                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {selectedCluster.complaint_ids.map(cid => {
                          const c = complaints.find(comp => comp.id === cid);
                          if (!c) return null;
                          return (
                            <div
                              key={c.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition relative group"
                            >
                              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                                <span>{c.complaint_code}</span>
                                {getSeverityBadge(c.severity)}
                              </div>
                              <div className="mt-1.5 text-xs font-bold text-slate-800">
                                Filer: {c.citizen_name}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {c.description}
                              </p>
                              <div className="mt-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedComplaint(c);
                                    setSelectedCluster(null);
                                  }}
                                  className="text-[11px] font-bold text-[#1d5fe0] hover:underline"
                                >
                                  Audit Raw Filer Details →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              ) : selectedComplaint ? (
                // Inspector for selected single Complaint (as before)
                <SectionCard title="Inspector Panel" description="Review details of the selected citizen grievance filing.">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-base font-extrabold text-[#0a2240]">
                          {selectedComplaint.complaint_code}
                        </span>
                        <div className="text-xs text-slate-400">
                          Filed: {new Date(selectedComplaint.submitted_at).toLocaleString()}
                        </div>
                      </div>
                      <div>{getStatusBadge(selectedComplaint.status)}</div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Filer Information</h4>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm">
                        <div className="font-bold text-[#0a2240]">{selectedComplaint.citizen_name}</div>
                        {selectedComplaint.phone_number && (
                          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{selectedComplaint.phone_number}</span>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                          <strong>Address:</strong> {selectedComplaint.address}, {selectedComplaint.city},{' '}
                          {selectedComplaint.state} - {selectedComplaint.pincode}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Grievance Description</h4>
                      <p className="text-sm text-slate-700 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 leading-relaxed whitespace-pre-wrap">
                        {selectedComplaint.description}
                      </p>
                    </div>

                    {selectedComplaint.ai_summary && (
                      <div className="space-y-2 bg-[#fdf4ff]/70 border border-[#f5d0fe] rounded-2xl p-4">
                        <div className="flex items-start gap-1.5 text-[#a21caf] font-bold text-xs">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                          <span>Automated AI Summary</span>
                        </div>
                        <p className="text-xs text-[#701a75] leading-relaxed mt-1">
                          {selectedComplaint.ai_summary}
                        </p>
                        <div className="flex flex-wrap gap-4 text-[10px] text-[#701a75] pt-2 border-t border-[#f5d0fe]/60 mt-2">
                          <span><strong>AI Severity:</strong> <span className="capitalize">{selectedComplaint.severity}</span></span>
                          <span><strong>AI Category:</strong> {selectedComplaint.category}</span>
                        </div>
                      </div>
                    )}

                    {selectedComplaint.generated_complaint && (
                      <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-white shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-1.5 w-full bg-[#138808]"></div>
                        <h4 className="text-xs font-bold text-[#0a2240] flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-[#138808]" />
                          <span>Official Grievance Draft</span>
                        </h4>
                        <div className="text-[11px] text-slate-600 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap border-t border-slate-100 pt-2 mt-2 font-serif">
                          {selectedComplaint.generated_complaint}
                        </div>
                      </div>
                    )}

                    {selectedComplaint.image_url && (
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Filing Attachment</h4>
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                          <img
                            src={selectedComplaint.image_url}
                            alt="Citizen submitted attachment"
                            className="max-h-60 w-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">Redressal Action</h4>
                      <div className="flex gap-2">
                        <select
                          value={selectedComplaint.status}
                          disabled={updatingId === selectedComplaint.id}
                          onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#1d5fe0] disabled:opacity-55"
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
                      </div>
                    </div>
                  </div>
                </SectionCard>
              ) : (
                <SectionCard title="Inspector Panel" description="Audit workspace metrics and inspect groupings.">
                  <div className="flex h-80 flex-col items-center justify-center text-slate-400 text-center p-6 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                    <AlertCircle className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm font-semibold">Select a complaint or AI cluster from the inbox list to inspect details.</p>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
