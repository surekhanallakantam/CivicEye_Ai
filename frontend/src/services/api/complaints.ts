import { apiClient } from './client';

export type ComplaintCreatePayload = {
  name: string;
  phone?: string;
  description: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  image_url?: string;
};

export async function submitComplaint(payload: ComplaintCreatePayload) {
  const response = await apiClient.post('/api/v1/complaints', payload);
  return response.data;
}

export async function trackComplaint(complaintCode: string) {
  const response = await apiClient.get(`/api/v1/complaints/${complaintCode}`);
  return response.data;
}
