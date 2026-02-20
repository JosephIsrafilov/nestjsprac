import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CurrentUserType } from '../auth/types/current-user.type';
import { TASK_ACTION_TYPE, TASK_STATUS, USER_ROLE } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, currentUser: CurrentUserType) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.project_id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const assignee = await this.prisma.user.findUnique({
      where: { id: dto.assigned_to },
    });

    if (!assignee) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role === USER_ROLE.member &&
      project.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You can only create tasks in your own projects',
      );
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        projectId: dto.project_id,
        assignedTo: dto.assigned_to,
        dueDate: dto.due_date
          ? this.parseDateOnly(dto.due_date, 'due_date')
          : null,
      },
    });
  }

  list(query: ListTasksQueryDto) {
    const where: Prisma.TaskWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.assigned_to) {
      where.assignedTo = query.assigned_to;
    }

    if (query.due_from || query.due_to) {
      const dueDateFilter: Prisma.DateTimeNullableFilter = {};

      if (query.due_from) {
        dueDateFilter.gte = this.parseDateOnly(query.due_from, 'due_from');
      }

      if (query.due_to) {
        dueDateFilter.lte = this.parseDateOnly(query.due_to, 'due_to');
      }

      where.dueDate = dueDateFilter;
    }

    if (query.search && query.search.trim()) {
      where.OR = [
        {
          title: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async update(
    taskId: number,
    dto: UpdateTaskDto,
    currentUser: CurrentUserType,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (
      currentUser.role === USER_ROLE.member &&
      task.project.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You can only update tasks in your own projects',
      );
    }

    if (
      dto.status &&
      task.status === TASK_STATUS.done &&
      dto.status !== TASK_STATUS.done
    ) {
      throw new BadRequestException("Can't change a task back from done");
    }

    if (dto.project_id && dto.project_id !== task.projectId) {
      throw new BadRequestException('Cannot move task to another project');
    }

    if (dto.assigned_to) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assigned_to },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const updateData: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
    }

    if (dto.assigned_to !== undefined) {
      updateData.assignee = {
        connect: { id: dto.assigned_to },
      };
    }

    if (dto.due_date !== undefined) {
      updateData.dueDate = this.parseDateOnly(dto.due_date, 'due_date');
    }

    const activities: Prisma.TaskActivityCreateManyInput[] = [];

    if (dto.status !== undefined && dto.status !== task.status) {
      activities.push({
        taskId,
        actionType: TASK_ACTION_TYPE.status_changed,
        oldValue: task.status,
        newValue: dto.status,
        changedBy: currentUser.id,
      });
    }

    if (dto.assigned_to !== undefined && dto.assigned_to !== task.assignedTo) {
      activities.push({
        taskId,
        actionType: TASK_ACTION_TYPE.reassigned,
        oldValue: String(task.assignedTo),
        newValue: String(dto.assigned_to),
        changedBy: currentUser.id,
      });
    }

    if (dto.title !== undefined && dto.title !== task.title) {
      activities.push({
        taskId,
        actionType: TASK_ACTION_TYPE.edited,
        oldValue: task.title,
        newValue: dto.title,
        changedBy: currentUser.id,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: updateData,
      });

      if (activities.length > 0) {
        await tx.taskActivity.createMany({
          data: activities,
        });
      }

      return updated;
    });
  }

  async getActivity(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
    });
  }

  private parseDateOnly(value: string, fieldName: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`${fieldName} must be YYYY-MM-DD format`);
    }

    const [yearPart, monthPart, dayPart] = value.split('-');
    const year = Number(yearPart);
    const month = Number(monthPart);
    const day = Number(dayPart);

    const date = new Date(Date.UTC(year, month - 1, day));
    const isValid =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day;

    if (!isValid) {
      throw new BadRequestException(
        `${fieldName} is not a valid calendar date`,
      );
    }

    return date;
  }
}
