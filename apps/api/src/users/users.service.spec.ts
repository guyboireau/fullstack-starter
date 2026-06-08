import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

describe('UsersService', () => {
  let service: UsersService;
  let authService: AuthService;

  const ACCESS_TOKEN = 'test-token';
  const USER_ID = 'user-uuid-1';

  beforeEach(() => {
    authService = {
      getClientForUser: vi.fn(),
    } as unknown as AuthService;

    service = new UsersService(authService);
  });

  // -------------------------------------------------------------------------
  // getProfile
  // -------------------------------------------------------------------------
  describe('getProfile', () => {
    it('returns the profile when found', async () => {
      const profile = { id: USER_ID, email: 'user@example.com', full_name: 'Test User' };
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      const result = await service.getProfile(ACCESS_TOKEN, USER_ID);

      expect(authService.getClientForUser).toHaveBeenCalledWith(ACCESS_TOKEN);
      expect(result).toEqual(profile);
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

      await expect(service.getProfile(ACCESS_TOKEN, USER_ID)).rejects.toThrow(NotFoundException);
      await expect(service.getProfile(ACCESS_TOKEN, USER_ID)).rejects.toThrow(
        'Profile not found',
      );
    });

    it('throws NotFoundException when Supabase returns an error', async () => {
      const client = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: new Error('profile query failed') }),
        }),
      };
      vi.mocked(authService.getClientForUser).mockReturnValue(client as never);

      await expect(service.getProfile(ACCESS_TOKEN, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('queries the profiles table with the correct user id', async () => {
      const profile = { id: USER_ID };
      const singleMock = vi.fn().mockResolvedValue({ data: profile, error: null });
      const eqMock = vi.fn().mockReturnThis();
      eqMock.single = singleMock;
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      const client = { from: fromMock };

      // Use a fresh builder so we can inspect calls
      const chainBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: profile, error: null }),
      };
      const client2 = { from: vi.fn().mockReturnValue(chainBuilder) };

      vi.mocked(authService.getClientForUser).mockReturnValue(client2 as never);

      await service.getProfile(ACCESS_TOKEN, USER_ID);

      expect(client2.from).toHaveBeenCalledWith('profiles');
      expect(chainBuilder.eq).toHaveBeenCalledWith('id', USER_ID);
    });
  });
});
