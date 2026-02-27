import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Task,
  TaskActionType,
  TaskStatus,
  UserRole,
} from '@prisma/client';
import type { CurrentUserType } from '../../auth/types/current-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

type TaskWithProjectOwner = Prisma.TaskGetPayload<{
  include: {
    project: {
      select: {
        createdBy: true;
      };
    };
  };
}>;

@Injectable()
export class TasksService {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 50;

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, currentUser: CurrentUserType) {
    const project = await this.getProjectOrThrow(dto.project_id);
    await this.getUserOrThrow(dto.assigned_to);
    this.assertProjectAccess(currentUser, project.createdBy, 'create');

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
    const { skip, take } = this.buildPagination(query);

    return this.prisma.task.findMany({
      where: this.buildListWhere(query),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take,
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(
    taskId: number,
    dto: UpdateTaskDto,
    currentUser: CurrentUserType,
  ) {
    const task = await this.getTaskWithProjectOwnerOrThrow(taskId);
    this.assertProjectAccess(currentUser, task.project.createdBy, 'update');
    this.validateTaskUpdate(task, dto);

    if (dto.assigned_to !== undefined) {
      await this.getUserOrThrow(dto.assigned_to);
    }

    const updateData = this.buildTaskUpdateData(dto);
    const activities = this.buildActivityLog(task, dto, currentUser.id, taskId);

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
    await this.getTaskOrThrow(taskId);

    return this.prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
      include: {
        changedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async remove(taskId: number): Promise<{ id: number }> {
    await this.getTaskOrThrow(taskId);

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { id: taskId };
  }

  private buildListWhere(query: ListTasksQueryDto): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.assigned_to) {
      where.assignedTo = query.assigned_to;
    }

    if (query.project_id) {
      where.projectId = query.project_id;
    }

    let dueFrom: Date | undefined;
    let dueTo: Date | undefined;

    if (query.due_from) {
      dueFrom = this.parseDateOnly(query.due_from, 'due_from');
    }

    if (query.due_to) {
      dueTo = this.parseDateOnly(query.due_to, 'due_to');
    }

    if (dueFrom && dueTo && dueFrom > dueTo) {
      throw new BadRequestException('due_from cannot be later than due_to');
    }

    if (dueFrom || dueTo) {
      const dueDateFilter: Prisma.DateTimeNullableFilter = {};

      if (dueFrom) {
        dueDateFilter.gte = dueFrom;
      }

      if (dueTo) {
        dueDateFilter.lte = dueTo;
      }

      where.dueDate = dueDateFilter;
    }

    const search = query.search?.trim();
    if (!search) {
      return where;
    }

    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    return where;
  }

  private buildPagination(query: ListTasksQueryDto): {
    skip: number;
    take: number;
  } {
    const page = query.page ?? TasksService.DEFAULT_PAGE;
    const take = query.limit ?? TasksService.DEFAULT_LIMIT;

    return {
      skip: (page - 1) * take,
      take,
    };
  }

  private buildTaskUpdateData(dto: UpdateTaskDto): Prisma.TaskUpdateInput {
    const data: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.priority !== undefined) {
      data.priority = dto.priority;
    }

    if (dto.assigned_to !== undefined) {
      data.assignee = { connect: { id: dto.assigned_to } };
    }

    if (dto.due_date !== undefined) {
      data.dueDate =
        dto.due_date === null
          ? null
          : this.parseDateOnly(dto.due_date, 'due_date');
    }

    return data;
  }

  private buildActivityLog(
    task: Task,
    dto: UpdateTaskDto,
    changedBy: number,
    taskId: number,
  ): Prisma.TaskActivityCreateManyInput[] {
    const events: Prisma.TaskActivityCreateManyInput[] = [];

    if (dto.status !== undefined && dto.status !== task.status) {
      events.push({
        taskId,
        actionType: TaskActionType.status_changed,
        oldValue: task.status,
        newValue: dto.status,
        changedBy,
      });
    }

    if (dto.assigned_to !== undefined && dto.assigned_to !== task.assignedTo) {
      events.push({
        taskId,
        actionType: TaskActionType.reassigned,
        oldValue: String(task.assignedTo),
        newValue: String(dto.assigned_to),
        changedBy,
      });
    }

    if (dto.title !== undefined && dto.title !== task.title) {
      events.push({
        taskId,
        actionType: TaskActionType.edited,
        oldValue: task.title,
        newValue: dto.title,
        changedBy,
      });
    }

    if (dto.description !== undefined && dto.description !== task.description) {
      events.push({
        taskId,
        actionType: TaskActionType.edited,
        oldValue: task.description,
        newValue: dto.description,
        changedBy,
      });
    }

    return events;
  }

  private validateTaskUpdate(
    task: TaskWithProjectOwner,
    dto: UpdateTaskDto,
  ): void {
    if (
      dto.status !== undefined &&
      task.status === TaskStatus.done &&
      dto.status !== TaskStatus.done
    ) {
      throw new BadRequestException('Task in done status cannot be reopened');
    }

    if (dto.project_id !== undefined && dto.project_id !== task.projectId) {
      throw new BadRequestException(
        'Moving task to another project is not allowed',
      );
    }
  }

  private assertProjectAccess(
    currentUser: CurrentUserType,
    ownerId: number,
    action: 'create' | 'update',
  ): void {
    if (currentUser.role === UserRole.member && ownerId !== currentUser.id) {
      throw new ForbiddenException(
        action === 'create'
          ? 'You can create tasks only in your own projects'
          : 'You can update tasks only in your own projects',
      );
    }
  }

  private async getProjectOrThrow(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project was not found');
    }

    return project;
  }

  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return user;
  }

  private async getTaskOrThrow(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task was not found');
    }

    return task;
  }

  private async getTaskWithProjectOwnerOrThrow(
    taskId: number,
  ): Promise<TaskWithProjectOwner> {
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
      throw new NotFoundException('Task was not found');
    }

    return task;
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
