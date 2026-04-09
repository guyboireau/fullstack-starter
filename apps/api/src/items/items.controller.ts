import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupabaseAuthGuard, AuthenticatedRequest } from '../auth/guards/supabase-auth.guard';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
@UseGuards(SupabaseAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.itemsService.findAll(req.accessToken, req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.itemsService.findOne(req.accessToken, req.user.id, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateItemDto) {
    return this.itemsService.create(req.accessToken, req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.update(req.accessToken, req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.itemsService.remove(req.accessToken, req.user.id, id);
  }
}
