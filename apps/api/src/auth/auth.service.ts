import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
      );
    }

    this.supabase = createClient(url, key);
  }

  /**
   * Validate a JWT access token and return the user.
   */
  async validateToken(token: string): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) return null;
    return user;
  }

  /**
   * Get the admin Supabase client (service role).
   * Used for privileged operations.
   */
  getAdminClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Create a scoped Supabase client for a specific user's JWT.
   * This respects RLS policies.
   */
  getClientForUser(accessToken: string): SupabaseClient {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY')!;

    return createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
}
