import { describe, it, expect, vi, beforeEach } from 'vitest';
import { itemsService } from './items';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('itemsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = 'test-token';

  it('fetchItems returns items', async () => {
    const items = [{ id: '1', title: 'Test' }];
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => items,
    });
    const result = await itemsService.fetchItems(token);
    expect(result).toEqual(items);
    expect(mockFetch).toHaveBeenCalledWith('/api/items', {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it('fetchItems throws on error', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(itemsService.fetchItems(token)).rejects.toThrow(
      'Failed to fetch items',
    );
  });

  it('createItem sends POST and returns item', async () => {
    const item = { id: '1', title: 'New' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => item,
    });
    const result = await itemsService.createItem(token, {
      title: 'New',
      description: '',
      status: 'todo',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New', description: '', status: 'todo' }),
      }),
    );
    expect(result).toEqual(item);
  });

  it('updateItem sends PATCH and returns item', async () => {
    const item = { id: '1', title: 'Updated' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => item,
    });
    const result = await itemsService.updateItem(token, '1', {
      title: 'Updated',
      description: '',
      status: 'done',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items/1',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result).toEqual(item);
  });

  it('deleteItem sends DELETE', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    await itemsService.deleteItem(token, '1');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items/1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
