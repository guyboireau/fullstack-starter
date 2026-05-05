import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

const mockItemsService = () => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
});

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ReturnType<typeof mockItemsService>;

  beforeEach(() => {
    service = mockItemsService();
    controller = new ItemsController(service as unknown as ItemsService);
  });

  const req = {
    accessToken: 'token',
    user: { id: 'user-1' },
  } as any;

  it('findAll calls service', async () => {
    const items = [{ id: '1' }];
    service.findAll.mockResolvedValue(items);
    const result = await controller.findAll(req);
    expect(service.findAll).toHaveBeenCalledWith('token', 'user-1');
    expect(result).toEqual(items);
  });

  it('findOne calls service', async () => {
    const item = { id: '1' };
    service.findOne.mockResolvedValue(item);
    const result = await controller.findOne(req, '1');
    expect(service.findOne).toHaveBeenCalledWith('token', 'user-1', '1');
    expect(result).toEqual(item);
  });

  it('create calls service', async () => {
    const item = { id: '1' };
    const dto = { title: 'New', description: 'desc', status: 'todo' as const };
    service.create.mockResolvedValue(item);
    const result = await controller.create(req, dto);
    expect(service.create).toHaveBeenCalledWith('token', 'user-1', dto);
    expect(result).toEqual(item);
  });

  it('update calls service', async () => {
    const item = { id: '1' };
    const dto = { title: 'Updated' };
    service.update.mockResolvedValue(item);
    const result = await controller.update(req, '1', dto);
    expect(service.update).toHaveBeenCalledWith('token', 'user-1', '1', dto);
    expect(result).toEqual(item);
  });

  it('remove calls service', async () => {
    service.remove.mockResolvedValue({ deleted: true });
    const result = await controller.remove(req, '1');
    expect(service.remove).toHaveBeenCalledWith('token', 'user-1', '1');
    expect(result).toEqual({ deleted: true });
  });
});
