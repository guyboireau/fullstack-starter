import { describe, it, expect } from 'vitest';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const controller = new AuthController();

  it('returns profile from request user', () => {
    const req = {
      user: {
        id: 'user-1',
        email: 'a@b.com',
        user_metadata: { full_name: 'John' },
        created_at: '2024-01-01',
      },
      accessToken: 'token',
    } as any;

    const result = controller.getProfile(req);
    expect(result).toEqual({
      id: 'user-1',
      email: 'a@b.com',
      user_metadata: { full_name: 'John' },
      created_at: '2024-01-01',
    });
  });
});
