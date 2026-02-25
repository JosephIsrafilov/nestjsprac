import { TaskPriority, TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  project_id!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigned_to!: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'due_date must be YYYY-MM-DD format',
  })
  due_date?: string;
}
