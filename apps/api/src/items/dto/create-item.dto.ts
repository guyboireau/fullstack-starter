import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

// Defined here and reused in UpdateItemDto to avoid duplication.
export type ItemStatus = 'todo' | 'in_progress' | 'done';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: ItemStatus;
}