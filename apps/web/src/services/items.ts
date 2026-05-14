import type { Item, ItemFormValues } from '@/schemas/item';

const API_BASE = import.meta.env.API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.status === 204 ? undefined as T : (res.json() as Promise<T>);
}

export const itemsService = {
  list: (token: string) =>
    apiFetch<Item[]>('/items', token),

  get: (token: string, id: string) =>
    apiFetch<Item>(`/items/${id}`, token),

  create: (token: string, payload: ItemFormValues) =>
    apiFetch<Item>('/items', token, { method: 'POST', body: JSON.stringify(payload) }),

  update: (token: string, id: string, payload: Partial<ItemFormValues>) =>
    apiFetch<Item>(`/items/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) }),

  remove: (token: string, id: string) =>
    apiFetch<void>(`/items/${id}`, token, { method: 'DELETE' }),
};
