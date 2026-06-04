import { apiClient } from './client';

export type RegisterPayload = {
  name: string;
  email: string;
  password_hash?: string; // mapped from password
  password?: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password?: string;
};

export type CitizenResponseData = {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role?: string;
};

export type TokenResponseData = {
  access_token: string;
  token_type: string;
  citizen: CitizenResponseData;
};

export async function citizenRegister(payload: RegisterPayload): Promise<TokenResponseData> {
  const response = await apiClient.post('/api/v1/auth/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone || null,
  });
  return response.data;
}

export async function citizenLogin(payload: LoginPayload): Promise<TokenResponseData> {
  const response = await apiClient.post('/api/v1/auth/login', {
    email: payload.email,
    password: payload.password,
  });
  return response.data;
}

export async function getCitizenProfile(): Promise<CitizenResponseData> {
  const response = await apiClient.get('/api/v1/auth/me');
  return response.data;
}
