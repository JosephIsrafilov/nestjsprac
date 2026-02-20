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
import type { AuthUser } from '../auth/auth.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() currentUser: AuthUser) {
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
    @CurrentUser() currentUser: AuthUser,
  ) {
    return this.tasksService.update(taskId, dto, currentUser);
  }

  @Get(':id/activity')
  getActivity(@Param('id', ParseIntPipe) taskId: number) {
    return this.tasksService.getActivity(taskId);
  }
}
