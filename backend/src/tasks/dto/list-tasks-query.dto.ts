import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TASK_STATUS } from '../../common/constants';
import type { TaskStatus } from '../../common/constants';

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
