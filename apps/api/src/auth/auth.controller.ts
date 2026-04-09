import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AuthenticatedRequest } from './guards/supabase-auth.guard';

@Controller('auth')
export class AuthController {
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
