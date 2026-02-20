import { Prisma } from '@prisma/client';
import type { CurrentUser } from '../auth/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './tasks.dto';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTaskDto, currentUser: CurrentUser): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        description: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        projectId: number;
        assignedTo: number;
        updatedAt: Date;
    }>;
    list(query: ListTasksQueryDto): Prisma.PrismaPromise<{
        createdAt: Date;
        id: number;
        title: string;
        description: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        projectId: number;
        assignedTo: number;
        updatedAt: Date;
    }[]>;
    update(taskId: number, dto: UpdateTaskDto, currentUser: CurrentUser): Promise<{
        createdAt: Date;
        id: number;
        title: string;
        description: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        projectId: number;
        assignedTo: number;
        updatedAt: Date;
    }>;
    getActivity(taskId: number): Promise<{
        id: number;
        taskId: number;
        actionType: import("@prisma/client").$Enums.TaskActionType;
        oldValue: string | null;
        newValue: string | null;
        changedBy: number;
        timestamp: Date;
    }[]>;
    private parseDateOnly;
}
