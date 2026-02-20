import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserType } from '../auth/types/current-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.tasksService.create(dto, currentUser);
  }

  @Get()
  list(@Query() query: ListTasksQueryDto) {
    return this.tasksService.list(query);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.tasksService.update(taskId, dto, currentUser);
  }

  @Get(':id/activity')
  getActivity(@Param('id', ParseIntPipe) taskId: number) {
    return this.tasksService.getActivity(taskId);
  }
}
