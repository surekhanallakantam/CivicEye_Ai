import { apiClient } from './client';

export type ComplaintCreatePayload = {
  name: string;
  phone?: string;
  description: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
};

export async function submitComplaint(payload: ComplaintCreatePayload) {
  const response = await apiClient.post('/api/v1/complaints', payload);
  return response.data;
}

export async function trackComplaint(complaintCode: string) {
  const response = await apiClient.get(`/api/v1/complaints/${complaintCode}`);
  return response.data;
}

export async function trackComplaintTimeline(complaintCode: string) {
  const response = await apiClient.get(`/api/v1/complaints/${complaintCode}/timeline`);
  return response.data;
}

export async function getMyComplaints() {
  const response = await apiClient.get('/api/v1/complaints/my');
  return response.data;
}

