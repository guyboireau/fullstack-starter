import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';
import type { ItemStatus } from './create-item.dto';

export class UpdateItemDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: ItemStatus;
}