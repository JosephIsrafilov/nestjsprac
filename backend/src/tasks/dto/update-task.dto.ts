import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TASK_PRIORITY, TASK_STATUS } from '../../common/constants';
import type { TaskPriority, TaskStatus } from '../../common/constants';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
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
