import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { AuthService } from '../auth/auth.service';
import type { CreateItemDto } from './dto/create-item.dto';
import type { UpdateItemDto } from './dto/update-item.dto';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ItemsService', () => {
  let service: ItemsService;
  let authService: AuthService;

  const ACCESS_TOKEN = 'test-token';
  const USER_ID = 'user-uuid-1';
  const ITEM_ID = 'item-uuid-1';

  beforeEach(() => {
    // Create a minimal AuthService mock
    authService = {
      getClientForUser: vi.fn(),
    } as unknown as AuthService;

    service = new ItemsService(authService);
  });

  // -------------------------------------------------------------------------
  // findAll
  // -------------------------------------------------------------------------
  describe('findAll', () => {
    it('returns the list of items on success', async () => {
      const items = [{ id: ITEM_ID, title: 'Test item', user_id: USER_ID }];
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: items, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      const result = await service.findAll(ACCESS_TOKEN, USER_ID);

      expect(authService.getClientForUser).toHaveBeenCalledWith(ACCESS_TOKEN);
      expect(result).toEqual(items);
    });

    it('throws when Supabase returns an error', async () => {
      const supabaseError = new Error('DB error');
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: null, error: supabaseError }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.findAll(ACCESS_TOKEN, USER_ID)).rejects.toThrow('DB error');
    });
  });

  // -------------------------------------------------------------------------
  // findOne
  // -------------------------------------------------------------------------
  describe('findOne', () => {
    it('returns the item when found', async () => {
      const item = { id: ITEM_ID, title: 'Test', user_id: USER_ID };
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: item, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      const result = await service.findOne(ACCESS_TOKEN, USER_ID, ITEM_ID);
      expect(result).toEqual(item);
    });

    it('throws NotFoundException when data is null', async () => {
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.findOne(ACCESS_TOKEN, USER_ID, ITEM_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when Supabase returns an error', async () => {
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.findOne(ACCESS_TOKEN, USER_ID, ITEM_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------
  describe('create', () => {
    it('returns the created item on success', async () => {
      const dto: CreateItemDto = { title: 'New item', status: 'todo' };
      const created = { id: ITEM_ID, ...dto, user_id: USER_ID };
      const client = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: created, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      const result = await service.create(ACCESS_TOKEN, USER_ID, dto);
      expect(result).toEqual(created);
    });

    it('throws when Supabase returns an error', async () => {
      const dto: CreateItemDto = { title: 'New item' };
      const supabaseError = new Error('insert failed');
      const client = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: supabaseError }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.create(ACCESS_TOKEN, USER_ID, dto)).rejects.toThrow('insert failed');
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------
  describe('update', () => {
    it('returns the updated item on success', async () => {
      const dto: UpdateItemDto = { title: 'Updated title' };
      const updated = { id: ITEM_ID, title: 'Updated title', user_id: USER_ID };
      const client = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: updated, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      const result = await service.update(ACCESS_TOKEN, USER_ID, ITEM_ID, dto);
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when data is null after update', async () => {
      const dto: UpdateItemDto = { title: 'Updated' };
      const client = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.update(ACCESS_TOKEN, USER_ID, ITEM_ID, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when Supabase returns an error on update', async () => {
      const dto: UpdateItemDto = { status: 'done' };
      const client = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: new Error('update failed') }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.update(ACCESS_TOKEN, USER_ID, ITEM_ID, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // remove
  // -------------------------------------------------------------------------
  describe('remove', () => {
    /**
     * The remove method calls: .from().delete().eq('id', ...).eq('user_id', ...)
     * The last .eq() resolves the promise, so we need both .eq() calls to
     * return a thenable on the second call.
     */
    function makeDeleteClient(result: { data: unknown; error: unknown }) {
      // Second eq resolves the promise
      const eq2 = vi.fn().mockResolvedValue(result);
      // First eq returns an object with another eq
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      return {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({ eq: eq1 }),
        }),
      };
    }

    it('returns { deleted: true } on success', async () => {
      const client = makeDeleteClient({ data: null, error: null });
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      const result = await service.remove(ACCESS_TOKEN, USER_ID, ITEM_ID);
      expect(result).toEqual({ deleted: true });
    });

    it('throws when Supabase returns an error on delete', async () => {
      const supabaseError = new Error('delete failed');
      const client = makeDeleteClient({ data: null, error: supabaseError });
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.remove(ACCESS_TOKEN, USER_ID, ITEM_ID)).rejects.toThrow('delete failed');
    });
  });
});
