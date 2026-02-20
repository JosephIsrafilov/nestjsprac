import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskActionType, TaskStatus, UserRole } from '@prisma/client';
import { CurrentUserType } from '../auth/types/current-user.type';
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
      throw new NotFoundException('Project was not found');
    }

    const assignee = await this.prisma.user.findUnique({
      where: { id: dto.assigned_to },
    });

    if (!assignee) {
      throw new NotFoundException('Assigned user was not found');
    }

    if (
      currentUser.role === UserRole.member &&
      project.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Members can only create tasks in their own projects',
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
        dueDate: dto.due_date ? new Date(dto.due_date) : null,
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
        dueDateFilter.gte = new Date(query.due_from);
      }
      if (query.due_to) {
        dueDateFilter.lte = new Date(query.due_to);
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
    const existingTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (!existingTask) {
      throw new NotFoundException('Task was not found');
    }

    if (
      currentUser.role === UserRole.member &&
      existingTask.project.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Members can only update tasks in their own projects',
      );
    }

    if (
      dto.status &&
      existingTask.status === TaskStatus.done &&
      dto.status !== TaskStatus.done
    ) {
      throw new BadRequestException(
        'Task status cannot move from done to another state',
      );
    }

    if (dto.project_id && dto.project_id !== existingTask.projectId) {
      throw new BadRequestException('Changing project_id is not allowed');
    }

    if (dto.assigned_to) {
      const newAssignee = await this.prisma.user.findUnique({
        where: { id: dto.assigned_to },
      });

      if (!newAssignee) {
        throw new NotFoundException('Assigned user was not found');
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
      updateData.dueDate = new Date(dto.due_date);
    }

    const activities: Prisma.TaskActivityCreateManyInput[] = [];

    if (dto.status !== undefined && dto.status !== existingTask.status) {
      activities.push({
        taskId,
        actionType: TaskActionType.status_changed,
        oldValue: existingTask.status,
        newValue: dto.status,
        changedBy: currentUser.id,
      });
    }

    if (
      dto.assigned_to !== undefined &&
      dto.assigned_to !== existingTask.assignedTo
    ) {
      activities.push({
        taskId,
        actionType: TaskActionType.reassigned,
        oldValue: String(existingTask.assignedTo),
        newValue: String(dto.assigned_to),
        changedBy: currentUser.id,
      });
    }

    if (dto.title !== undefined && dto.title !== existingTask.title) {
      activities.push({
        taskId,
        actionType: TaskActionType.edited,
        oldValue: existingTask.title,
        newValue: dto.title,
        changedBy: currentUser.id,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: updateData,
      });

      if (activities.length > 0) {
        await tx.taskActivity.createMany({
          data: activities,
        });
      }

      return updatedTask;
    });
  }

  async getActivity(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task was not found');
    }

    return this.prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
