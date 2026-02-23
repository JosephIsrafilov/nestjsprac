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
import { TASK_PRIORITY, TASK_STATUS } from '../common/constants';
import type { TaskPriority, TaskStatus } from '../common/constants';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(TASK_STATUS)
  status!: TaskStatus;

  @IsEnum(TASK_PRIORITY)
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

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(TASK_STATUS)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TASK_PRIORITY)
  priority?: TaskPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  project_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigned_to?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'due_date must be YYYY-MM-DD format',
  })
  due_date?: string;
}

export class ListTasksQueryDto {
  @IsOptional()
  @IsEnum(TASK_STATUS)
  status?: TaskStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigned_to?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'due_from must be in YYYY-MM-DD format',
  })
  due_from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'due_to must be in YYYY-MM-DD format',
  })
  due_to?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
