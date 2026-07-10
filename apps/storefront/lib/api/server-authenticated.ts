import { cookies } from 'next/headers';
import { env } from '../env';
import { ApiError } from './errors';
import type { CustomerMap, OrderMap } from '@repo/shared-types';

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${env.API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Cookie', `accessToken=${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store' // dynamic data always
  });

  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || res.statusText, data?.error?.cause);
  }
  
  return data?.data as T;
}

export const CustomerAPI = {
  async getMe() {
    return authFetch<CustomerMap['MeResponse']>('/customers/me');
  }
};

export const OrderAPI = {
  async getMyOrders() {
    return authFetch<OrderMap['ListResponse']>('/orders');
  },
  async getOrderById(id: string) {
    return authFetch<OrderMap['ItemResponse']>(`/orders/${id}`);
  }
};
