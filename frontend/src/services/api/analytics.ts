import { apiClient } from './client';

export type HeatmapPoint = {
  id: string;
  complaint_code: string;
  citizen_name: string;
  description: string;
  state: string;
  city: string;
  category: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
};

export async function getHeatmapData(): Promise<HeatmapPoint[]> {
  const response = await apiClient.get('/api/v1/admin/analytics/heatmap');
  return response.data;
}
