import { ApiError } from './errors';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '/api';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
};

/**
 * Browser API Client (Client Components / Zustand)
 * Automatically prefixes URLs with the Next.js rewrite path /api
 */
export const apiClient = {
  async get<T>(url: string, init?: RequestInit): Promise<T> {
    return fetchBase(url, { ...init, method: 'GET' });
  },
  async post<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return fetchBase(url, {
      ...init,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  async patch<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return fetchBase(url, {
      ...init,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    return fetchBase(url, { ...init, method: 'DELETE' });
  }
};

async function fetchBase<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || res.statusText, data?.error?.cause);
  }
  
  return data?.data as T;
}
