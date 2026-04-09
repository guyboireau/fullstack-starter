import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  async getProfile(accessToken: string, userId: string) {
    const supabase = this.authService.getClientForUser(accessToken);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Profile not found');
    }

    return data;
  }
}
