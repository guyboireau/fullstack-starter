import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';
import type { AuthService } from '../auth/auth.service';

const mockSupabase = {
  from: vi.fn(),
};

const mockAuthService = {
  getClientForUser: vi.fn().mockReturnValue(mockSupabase),
} as unknown as AuthService;

function buildChain(result: object) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single'];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain['single'] = vi.fn().mockResolvedValue(result);
  chain['order'] = vi.fn().mockResolvedValue(result);
  chain['eq'] = vi.fn().mockReturnValue(chain);
  return chain;
}

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ItemsService(mockAuthService);
  });

  describe('findAll', () => {
    it('returns items for the user', async () => {
      const items = [{ id: '1', title: 'Test item', user_id: 'u1' }];
      const chain = buildChain({ data: items, error: null });
      mockSupabase.from.mockReturnValue(chain);
      chain['order'] = vi.fn().mockResolvedValue({ data: items, error: null });

      const result = await service.findAll('token', 'u1');
      expect(result).toEqual(items);
      expect(mockAuthService.getClientForUser).toHaveBeenCalledWith('token');
    });

    it('throws when Supabase returns an error', async () => {
      const chain = buildChain({});
      chain['order'] = vi.fn().mockResolvedValue({ data: null, error: new Error('db error') });
      mockSupabase.from.mockReturnValue(chain);

      await expect(service.findAll('token', 'u1')).rejects.toThrow('db error');
    });
  });

  describe('findOne', () => {
    it('returns a single item', async () => {
      const item = { id: '42', title: 'My item', user_id: 'u1' };
      const chain = buildChain({ data: item, error: null });
      mockSupabase.from.mockReturnValue(chain);

      const result = await service.findOne('token', 'u1', '42');
      expect(result).toEqual(item);
    });

    it('throws NotFoundException when item is missing', async () => {
      const chain = buildChain({ data: null, error: null });
      mockSupabase.from.mockReturnValue(chain);

      await expect(service.findOne('token', 'u1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates an item and returns it', async () => {
      const created = { id: '99', title: 'New item', user_id: 'u1' };
      const chain = buildChain({ data: created, error: null });
      mockSupabase.from.mockReturnValue(chain);

      const result = await service.create('token', 'u1', { title: 'New item' });
      expect(result).toEqual(created);
    });

    it('throws when Supabase insert fails', async () => {
      const chain = buildChain({ data: null, error: new Error('insert failed') });
      mockSupabase.from.mockReturnValue(chain);

      await expect(service.create('token', 'u1', { title: 'Bad' })).rejects.toThrow('insert failed');
    });
  });

  describe('remove', () => {
    it('returns deleted:true on success', async () => {
      // remove chain: .from().delete().eq('id').eq('user_id') — last eq resolves
      const secondEq = vi.fn().mockResolvedValue({ error: null });
      const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
      const deleteChain = { eq: firstEq };
      mockSupabase.from.mockReturnValue({ delete: vi.fn().mockReturnValue(deleteChain) });

      const result = await service.remove('token', 'u1', '1');
      expect(result).toEqual({ deleted: true });
    });
  });
});
