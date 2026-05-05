import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';

function createMockBuilder(
  finalResult: unknown,
  finalMethod: 'single' | 'eq' | 'order' = 'single',
) {
  const builder: any = {};
  builder.from = vi.fn(() => builder);
  builder.select = vi.fn(() => builder);
  builder.insert = vi.fn(() => builder);
  builder.update = vi.fn(() => builder);
  builder.delete = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);

  let eqCalls = 0;
  builder.eq = vi.fn(() => {
    eqCalls++;
    if (finalMethod === 'eq' && eqCalls === 2) {
      return Promise.resolve(finalResult);
    }
    return builder;
  });

  builder.single = vi.fn(() => {
    if (finalMethod === 'single') {
      return Promise.resolve(finalResult);
    }
    return builder;
  });

  return builder;
}

describe('ItemsService', () => {
  let service: ItemsService;
  let authService: { getClientForUser: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      getClientForUser: vi.fn(),
    };
    service = new ItemsService(authService as any);
  });

  it('findAll returns items ordered by created_at desc', async () => {
    const items = [{ id: '1', title: 'Item A' }];
    const builder = createMockBuilder({ data: items, error: null }, 'order');
    builder.order.mockResolvedValue({ data: items, error: null });
    authService.getClientForUser.mockReturnValue(builder);

    const result = await service.findAll('token', 'user-1');
    expect(authService.getClientForUser).toHaveBeenCalledWith('token');
    expect(builder.from).toHaveBeenCalledWith('items');
    expect(builder.select).toHaveBeenCalledWith('*');
    expect(builder.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(result).toEqual(items);
  });

  it('findOne returns a single item', async () => {
    const item = { id: '1', title: 'Item A' };
    const builder = createMockBuilder({ data: item, error: null }, 'single');
    authService.getClientForUser.mockReturnValue(builder);

    const result = await service.findOne('token', 'user-1', '1');
    expect(result).toEqual(item);
  });

  it('findOne throws NotFoundException when item not found', async () => {
    const builder = createMockBuilder(
      { data: null, error: new Error('not found') },
      'single',
    );
    authService.getClientForUser.mockReturnValue(builder);

    await expect(service.findOne('token', 'user-1', '1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create inserts item with user_id', async () => {
    const item = { id: '1', title: 'New Item' };
    const builder = createMockBuilder({ data: item, error: null }, 'single');
    builder.insert.mockReturnValue(builder);
    builder.select.mockReturnValue(builder);
    authService.getClientForUser.mockReturnValue(builder);

    const result = await service.create('token', 'user-1', {
      title: 'New Item',
      description: 'desc',
      status: 'todo',
    });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Item', user_id: 'user-1' }),
    );
    expect(result).toEqual(item);
  });

  it('update modifies item and sets updated_at', async () => {
    const item = { id: '1', title: 'Updated' };
    const builder = createMockBuilder({ data: item, error: null }, 'single');
    builder.update.mockReturnValue(builder);
    builder.select.mockReturnValue(builder);
    authService.getClientForUser.mockReturnValue(builder);

    const result = await service.update('token', 'user-1', '1', {
      title: 'Updated',
    });
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated',
        updated_at: expect.any(String),
      }),
    );
    expect(result).toEqual(item);
  });

  it('update throws NotFoundException when item missing', async () => {
    const builder = createMockBuilder(
      { data: null, error: new Error('not found') },
      'single',
    );
    builder.update.mockReturnValue(builder);
    builder.select.mockReturnValue(builder);
    authService.getClientForUser.mockReturnValue(builder);

    await expect(
      service.update('token', 'user-1', '1', { title: 'Updated' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('remove deletes item', async () => {
    const builder = createMockBuilder({ error: null }, 'eq');
    builder.delete.mockReturnValue(builder);
    authService.getClientForUser.mockReturnValue(builder);

    const result = await service.remove('token', 'user-1', '1');
    expect(result).toEqual({ deleted: true });
    expect(builder.delete).toHaveBeenCalled();
  });
});
