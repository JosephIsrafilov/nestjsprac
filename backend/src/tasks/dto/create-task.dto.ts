import { TaskPriority, TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
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
  @IsDateString()
  due_date?: string;
}
