import type { Item, ItemFormValues } from '@/schemas/item';
import { getEnv } from '@/lib/env';

/**
 * Résolu à chaque appel (et non au niveau module) : `import.meta.env.API_URL`
 * était substitué au build et figeait `http://localhost:3000` dans le bundle
 * de production, rendant l'admin inutilisable une fois déployé.
 */
function apiBase(): string {
  return getEnv('API_URL') ?? 'http://localhost:3000';
}

async function apiFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
  csrfToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.status === 204 ? undefined as T : (res.json() as Promise<T>);
}

export const itemsService = {
  list: (token: string, csrfToken?: string) =>
    apiFetch<Item[]>('/items', token, {}, csrfToken),

  get: (token: string, id: string, csrfToken?: string) =>
    apiFetch<Item>(`/items/${id}`, token, {}, csrfToken),

  create: (token: string, payload: ItemFormValues, csrfToken?: string) =>
    apiFetch<Item>('/items', token, { method: 'POST', body: JSON.stringify(payload) }, csrfToken),

  update: (token: string, id: string, payload: Partial<ItemFormValues>, csrfToken?: string) =>
    apiFetch<Item>(`/items/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) }, csrfToken),

  remove: (token: string, id: string, csrfToken?: string) =>
    apiFetch<void>(`/items/${id}`, token, { method: 'DELETE' }, csrfToken),
};
