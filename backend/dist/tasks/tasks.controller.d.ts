import type { CurrentUserType } from '../auth/types/current-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(dto: CreateTaskDto, currentUser: CurrentUserType): Promise<{
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
    list(query: ListTasksQueryDto): import("@prisma/client").Prisma.PrismaPromise<{
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
    update(taskId: number, dto: UpdateTaskDto, currentUser: CurrentUserType): Promise<{
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
}
