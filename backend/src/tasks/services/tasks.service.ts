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
import { NotificationsService } from '../../notifications/services/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

const taskDetailsInclude = Prisma.validator<Prisma.TaskInclude>()({
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
  taskTags: {
    include: {
      tag: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
});

type TaskDetails = Prisma.TaskGetPayload<{
  include: typeof taskDetailsInclude;
}>;

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateTaskDto, currentUser: CurrentUserType) {
    await this.validateCreateInput(dto, currentUser);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        projectId: dto.project_id,
        assignedTo: dto.assigned_to,
        dueDate: this.mapDueDate(dto.due_date, 'due_date'),
        taskTags: this.buildTaskTagsCreateInput(dto.tag_ids),
      },
      include: taskDetailsInclude,
    });

    const payload = this.serializeTask(task);
    this.publishCreateSideEffects(task.id, payload);

    return payload;
  }

  async list(query: ListTasksQueryDto) {
    const { skip, take } = this.buildPagination(query);
    const tasks = await this.prisma.task.findMany({
      where: this.buildListWhere(query),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take,
      include: taskDetailsInclude,
    });

    return tasks.map((task) => this.serializeTask(task));
  }

  async update(
    taskId: number,
    dto: UpdateTaskDto,
    currentUser: CurrentUserType,
  ) {
    const existingTask = await this.getTaskWithProjectOwnerOrThrow(taskId);
    this.validateTaskUpdate(existingTask, dto);
    this.assertProjectAccess(currentUser, existingTask.project.createdBy, 'update');
    await this.validateUpdateInput(dto);

    const activities = this.buildActivityLog(
      existingTask,
      dto,
      currentUser.id,
      taskId,
    );

    const updatedTask = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: this.buildTaskUpdateData(dto),
        include: taskDetailsInclude,
      });

      if (activities.length > 0) {
        await tx.taskActivity.createMany({ data: activities });
      }

      return updated;
    });

    const payload = this.serializeTask(updatedTask);
    this.publishUpdateSideEffects(taskId, existingTask.assignedTo, dto.assigned_to);
    this.realtimeGateway.broadcastTaskUpdated(payload);

    return payload;
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
    await this.prisma.task.delete({ where: { id: taskId } });

    void this.notificationsService.clearTaskDueDateReminder(taskId);
    this.realtimeGateway.broadcastTaskDeleted(taskId);

    return { id: taskId };
  }

  private async validateCreateInput(
    dto: CreateTaskDto,
    currentUser: CurrentUserType,
  ): Promise<void> {
    const project = await this.getProjectOrThrow(dto.project_id);
    this.assertProjectAccess(currentUser, project.createdBy, 'create');

    await Promise.all([
      this.getUserOrThrow(dto.assigned_to),
      this.assertTagIdsExist(dto.tag_ids ?? []),
    ]);
  }

  private async validateUpdateInput(dto: UpdateTaskDto): Promise<void> {
    const checks: Promise<unknown>[] = [];

    if (dto.assigned_to !== undefined) {
      checks.push(this.getUserOrThrow(dto.assigned_to));
    }

    if (dto.tag_ids !== undefined) {
      checks.push(this.assertTagIdsExist(dto.tag_ids));
    }

    if (checks.length > 0) {
      await Promise.all(checks);
    }
  }

  private publishCreateSideEffects(taskId: number, payload: unknown): void {
    void this.notificationsService.queueTaskAssignedEmail(taskId);
    void this.notificationsService.syncTaskDueDateReminder(taskId);
    this.realtimeGateway.broadcastTaskCreated(payload);
  }

  private publishUpdateSideEffects(
    taskId: number,
    previousAssigneeId: number,
    nextAssigneeId?: number,
  ): void {
    void this.notificationsService.syncTaskDueDateReminder(taskId);

    if (
      nextAssigneeId !== undefined &&
      nextAssigneeId !== previousAssigneeId
    ) {
      void this.notificationsService.queueTaskAssignedEmail(taskId);
    }
  }

  private buildListWhere(query: ListTasksQueryDto): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.assigned_to ? { assignedTo: query.assigned_to } : {}),
      ...(query.project_id ? { projectId: query.project_id } : {}),
    };

    const dueDateFilter = this.buildDueDateFilter(query.due_from, query.due_to);
    if (dueDateFilter) {
      where.dueDate = dueDateFilter;
    }

    const search = query.search?.trim();
    if (!search) {
      return where;
    }

    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      {
        taskTags: {
          some: {
            tag: { name: { contains: search, mode: 'insensitive' } },
          },
        },
      },
    ];

    return where;
  }

  private buildDueDateFilter(
    dueFromValue?: string,
    dueToValue?: string,
  ): Prisma.DateTimeNullableFilter | undefined {
    const dueFrom = dueFromValue
      ? this.parseDateOnly(dueFromValue, 'due_from')
      : undefined;
    const dueTo = dueToValue ? this.parseDateOnly(dueToValue, 'due_to') : undefined;

    if (!dueFrom && !dueTo) {
      return undefined;
    }

    if (dueFrom && dueTo && dueFrom > dueTo) {
      throw new BadRequestException('due_from cannot be later than due_to');
    }

    return {
      ...(dueFrom ? { gte: dueFrom } : {}),
      ...(dueTo ? { lte: dueTo } : {}),
    };
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
      data.dueDate = this.mapDueDate(dto.due_date, 'due_date');
    }

    if (dto.tag_ids !== undefined) {
      data.taskTags = {
        deleteMany: {},
        create: dto.tag_ids.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
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
    if (currentUser.role !== UserRole.member || ownerId === currentUser.id) {
      return;
    }

    throw new ForbiddenException(
      action === 'create'
        ? 'You can create tasks only in your own projects'
        : 'You can update tasks only in your own projects',
    );
  }

  private async getProjectOrThrow(projectId: number) {
    return this.ensureExists(
      this.prisma.project.findUnique({ where: { id: projectId } }),
      'Project was not found',
    );
  }

  private async getUserOrThrow(userId: number) {
    return this.ensureExists(
      this.prisma.user.findUnique({ where: { id: userId } }),
      'User was not found',
    );
  }

  private async getTaskOrThrow(taskId: number) {
    return this.ensureExists(
      this.prisma.task.findUnique({ where: { id: taskId }, select: { id: true } }),
      'Task was not found',
    );
  }

  private async getTaskWithProjectOwnerOrThrow(
    taskId: number,
  ): Promise<TaskWithProjectOwner> {
    return this.ensureExists(
      this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: {
            select: { createdBy: true },
          },
        },
      }),
      'Task was not found',
    );
  }

  private async ensureExists<T>(
    promise: Promise<T | null>,
    errorMessage: string,
  ): Promise<T> {
    const entity = await promise;
    if (entity) {
      return entity;
    }

    throw new NotFoundException(errorMessage);
  }

  private async assertTagIdsExist(tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const foundTags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true },
    });

    if (foundTags.length !== new Set(tagIds).size) {
      throw new NotFoundException('One or more tags were not found');
    }
  }

  private buildTaskTagsCreateInput(tagIds?: number[]) {
    if (!tagIds || tagIds.length === 0) {
      return undefined;
    }

    return {
      create: tagIds.map((tagId) => ({
        tag: { connect: { id: tagId } },
      })),
    };
  }

  private serializeTask(task: TaskDetails) {
    const { taskTags, ...rest } = task;

    return {
      ...rest,
      tags: taskTags.map((taskTag) => taskTag.tag),
    };
  }

  private mapDueDate(
    value: string | null | undefined,
    fieldName: string,
  ): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return this.parseDateOnly(value, fieldName);
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
