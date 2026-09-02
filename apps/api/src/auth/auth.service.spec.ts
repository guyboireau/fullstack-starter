import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: { getUser: vi.fn() } })),
}));

const URL = 'https://project.supabase.co';
const SERVICE_KEY = 'service-role-key';
const ANON_KEY = 'anon-key';

/** ConfigService renvoyant les valeurs fournies. */
function configWith(values: Record<string, string | undefined>): ConfigService {
  return { get: vi.fn((key: string) => values[key]) } as unknown as ConfigService;
}

describe('AuthService', () => {
  beforeEach(() => {
    vi.mocked(createClient).mockClear();
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn() },
    } as never);
  });

  describe('construction', () => {
    it('crée le client admin avec la clé service_role', () => {
      new AuthService(
        configWith({ SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY }),
      );

      expect(createClient).toHaveBeenCalledWith(URL, SERVICE_KEY);
    });

    it.each([
      ['SUPABASE_URL manquante', { SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY }],
      ['SUPABASE_SERVICE_ROLE_KEY manquante', { SUPABASE_URL: URL }],
      ['les deux manquantes', {}],
    ])('échoue au démarrage si %s', (_label, values) => {
      expect(() => new AuthService(configWith(values))).toThrow(
        /Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/,
      );
    });
  });

  describe('validateToken', () => {
    const USER = { id: 'user-uuid-1' } as User;
    let service: AuthService;
    let getUser: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      getUser = vi.fn();
      vi.mocked(createClient).mockReturnValue({ auth: { getUser } } as never);
      service = new AuthService(
        configWith({ SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY }),
      );
    });

    it('retourne l’utilisateur quand le token est valide', async () => {
      getUser.mockResolvedValue({ data: { user: USER }, error: null });

      await expect(service.validateToken('jwt')).resolves.toBe(USER);
      expect(getUser).toHaveBeenCalledWith('jwt');
    });

    it('retourne null quand Supabase renvoie une erreur', async () => {
      getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'invalid JWT' },
      });

      await expect(service.validateToken('jwt')).resolves.toBeNull();
    });

    it('retourne null quand aucun utilisateur n’est renvoyé', async () => {
      getUser.mockResolvedValue({ data: { user: null }, error: null });

      await expect(service.validateToken('jwt')).resolves.toBeNull();
    });
  });

  describe('getClientForUser', () => {
    it('utilise la clé anon et transmet le JWT, afin que les RLS s’appliquent', () => {
      const service = new AuthService(
        configWith({
          SUPABASE_URL: URL,
          SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
          SUPABASE_ANON_KEY: ANON_KEY,
        }),
      );
      vi.mocked(createClient).mockClear();

      service.getClientForUser('jwt-utilisateur');

      // La clé service_role contournerait les RLS : c'est bien la clé anon
      // qui doit être utilisée pour une requête faite au nom d'un utilisateur.
      expect(createClient).toHaveBeenCalledWith(URL, ANON_KEY, {
        global: { headers: { Authorization: 'Bearer jwt-utilisateur' } },
      });
    });
  });

  describe('getAdminClient', () => {
    it('retourne le client service_role construit au démarrage', () => {
      const admin = { auth: { getUser: vi.fn() } };
      vi.mocked(createClient).mockReturnValue(admin as never);

      const service = new AuthService(
        configWith({ SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY }),
      );

      expect(service.getAdminClient()).toBe(admin);
    });
  });
});
