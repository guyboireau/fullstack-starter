export interface Item {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
}

export interface ItemForm {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const itemsService = {
  async fetchItems(token: string): Promise<Item[]> {
    const response = await fetch(`${API_BASE}/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },

  async createItem(token: string, form: ItemForm): Promise<Item> {
    const response = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error('Failed to create item');
    return response.json();
  },

  async updateItem(token: string, id: string, form: ItemForm): Promise<Item> {
    const response = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  },

  async deleteItem(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete item');
  },
};
