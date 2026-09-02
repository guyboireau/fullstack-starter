import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { SupabaseAuthGuard, AuthenticatedRequest } from './supabase-auth.guard';
import { AuthService } from '../auth.service';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let authService: AuthService;

  const USER = { id: 'user-uuid-1', email: 'user@example.com' } as User;

  /** Construit un ExecutionContext minimal portant l'en-tête fourni. */
  function contextWith(authorization?: string): {
    context: ExecutionContext;
    request: Partial<AuthenticatedRequest>;
  } {
    const request: Partial<AuthenticatedRequest> = {
      headers: authorization === undefined ? {} : { authorization },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  }

  beforeEach(() => {
    authService = { validateToken: vi.fn() } as unknown as AuthService;
    guard = new SupabaseAuthGuard(authService);
  });

  describe('extraction du token', () => {
    it('accepte un en-tête Bearer bien formé et attache user + token', async () => {
      vi.mocked(authService.validateToken).mockResolvedValue(USER);
      const { context, request } = contextWith('Bearer jwt-valide');

      await expect(guard.canActivate(context)).resolves.toBe(true);

      expect(authService.validateToken).toHaveBeenCalledWith('jwt-valide');
      expect(request.user).toBe(USER);
      expect(request.accessToken).toBe('jwt-valide');
    });

    it('tolère plusieurs espaces entre le schéma et le token', async () => {
      vi.mocked(authService.validateToken).mockResolvedValue(USER);
      const { context } = contextWith('Bearer   jwt-valide');

      await expect(guard.canActivate(context)).resolves.toBe(true);

      // Sans trim(), le token aurait été « ␣␣jwt-valide » et Supabase l'aurait rejeté.
      expect(authService.validateToken).toHaveBeenCalledWith('jwt-valide');
    });

    it.each([
      ['en-tête absent', undefined],
      ['en-tête vide', ''],
      ['schéma seul, sans token', 'Bearer'],
      ['schéma suivi d’espaces seulement', 'Bearer   '],
      ['schéma non supporté', 'Basic dXNlcjpwYXNz'],
      ['schéma en minuscules', 'bearer jwt-valide'],
    ])('rejette : %s', async (_label, header) => {
      const { context } = contextWith(header);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(authService.validateToken).not.toHaveBeenCalled();
    });
  });

  describe('validation du token', () => {
    it('rejette quand le token est invalide ou expiré', async () => {
      vi.mocked(authService.validateToken).mockResolvedValue(null);
      const { context, request } = contextWith('Bearer jwt-expire');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(request.user).toBeUndefined();
    });

    it('ne divulgue pas le token dans le message d’erreur', async () => {
      vi.mocked(authService.validateToken).mockResolvedValue(null);
      const { context } = contextWith('Bearer secret-jwt-a-ne-pas-fuiter');

      await expect(guard.canActivate(context)).rejects.toThrow(
        /Invalid or expired token/,
      );
      await expect(guard.canActivate(context)).rejects.not.toThrow(
        /secret-jwt-a-ne-pas-fuiter/,
      );
    });
  });
});
