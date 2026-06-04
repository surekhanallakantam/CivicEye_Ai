import { apiClient } from './client';

export type DepartmentStats = {
  id: string;
  name: string;
  slug: string;
  is_geographic: boolean;
  is_active: boolean;
  total_complaints: number;
  resolved_complaints: number;
  pending_complaints: number;
};

export type DepartmentComplaint = {
  id: string;
  complaint_code: string;
  citizen_name: string;
  phone_number?: string;
  description: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  image_url?: string;
  status: string;
  severity?: string;
  category?: string;
  submitted_at: string;
  ai_summary?: string;
  generated_complaint?: string;
};

export async function getDepartments(): Promise<DepartmentStats[]> {
  const response = await apiClient.get('/api/v1/admin/departments');
  return response.data;
}

export async function getDepartmentComplaints(departmentId: string): Promise<DepartmentComplaint[]> {
  const response = await apiClient.get(`/api/v1/admin/departments/${departmentId}/complaints`);
  return response.data;
}

export async function updateComplaintStatus(
  complaintId: string,
  status: string,
  note: string = ''
): Promise<{ status: string; new_status: string }> {
  const response = await apiClient.patch(`/api/v1/admin/complaints/${complaintId}/status`, {
    status,
    note,
    changed_by: 'admin_console',
  });
  return response.data;
}


export type DepartmentCluster = {
  id: string;
  cluster_code: string;
  cluster_name: string;
  city?: string;
  state?: string;
  affected_citizens: number;
  first_reported_at: string;
  latest_reported_at: string;
  district_impact?: string;
  confidence_score?: number;
  status: string;
  ai_summary?: string;
  root_cause_insight?: string;
  complaint_ids: string[];
};

export async function getDepartmentClusters(departmentId: string): Promise<DepartmentCluster[]> {
  const response = await apiClient.get(`/api/v1/admin/departments/${departmentId}/clusters`);
  return response.data;
}

export async function runDepartmentClustering(departmentId: string): Promise<DepartmentCluster[]> {
  const response = await apiClient.post(`/api/v1/admin/departments/${departmentId}/cluster`);
  return response.data;
}
