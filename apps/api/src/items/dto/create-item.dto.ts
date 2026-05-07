import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

// Defined here and reused in UpdateItemDto to avoid duplication.
export type ItemStatus = 'todo' | 'in_progress' | 'done';

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: ItemStatus;
}