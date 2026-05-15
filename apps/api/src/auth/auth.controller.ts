import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AuthenticatedRequest } from './guards/supabase-auth.guard';

@Controller('auth')
export class AuthController {
  /**
   * Return the current CSRF token for the double-submit cookie pattern.
   * The frontend reads this value and sends it back in the X-CSRF-Token header
   * for every state-changing request.
   */
  @Get('csrf')
  getCsrf(@Req() req: Request & { cookies: Record<string, string> }) {
    return {
      token: req.cookies?.['csrf-secret'] ?? null,
    };
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return {
      id: req.user.id,
      email: req.user.email,
      user_metadata: req.user.user_metadata,
      created_at: req.user.created_at,
    };
  }
}
