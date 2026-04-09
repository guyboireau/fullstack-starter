import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly authService: AuthService) {}

  async findAll(accessToken: string, userId: string) {
    const supabase = this.authService.getClientForUser(accessToken);

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(accessToken: string, userId: string, id: string) {
    const supabase = this.authService.getClientForUser(accessToken);

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Item ${id} not found`);
    }

    return data;
  }

  async create(accessToken: string, userId: string, dto: CreateItemDto) {
    const supabase = this.authService.getClientForUser(accessToken);

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...dto,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(accessToken: string, userId: string, id: string, dto: UpdateItemDto) {
    const supabase = this.authService.getClientForUser(accessToken);

    const { data, error } = await supabase
      .from('items')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Item ${id} not found`);
    }

    return data;
  }

  async remove(accessToken: string, userId: string, id: string) {
    const supabase = this.authService.getClientForUser(accessToken);

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { deleted: true };
  }
}
