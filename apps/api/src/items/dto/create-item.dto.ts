import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

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