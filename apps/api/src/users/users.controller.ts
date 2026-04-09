import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SupabaseAuthGuard, AuthenticatedRequest } from '../auth/guards/supabase-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.accessToken, req.user.id);
  }
}
