import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = () => ({
  getProfile: vi.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: ReturnType<typeof mockUsersService>;

  beforeEach(() => {
    service = mockUsersService();
    controller = new UsersController(service as unknown as UsersService);
  });

  const req = {
    accessToken: 'token',
    user: { id: 'user-1' },
  } as any;

  it('getMe returns profile from service', async () => {
    const profile = {
      id: 'user-1',
      email: 'a@b.com',
      full_name: 'John',
    };
    service.getProfile.mockResolvedValue(profile);
    const result = await controller.getMe(req);
    expect(service.getProfile).toHaveBeenCalledWith('token', 'user-1');
    expect(result).toEqual(profile);
  });
});
