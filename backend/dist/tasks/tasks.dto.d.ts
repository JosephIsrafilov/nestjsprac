import type { TaskPriority, TaskStatus } from '../common/constants';
export declare class CreateTaskDto {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    project_id: number;
    assigned_to: number;
    due_date?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    project_id?: number;
    assigned_to?: number;
    due_date?: string;
}
export declare class ListTasksQueryDto {
    status?: TaskStatus;
    assigned_to?: number;
    due_from?: string;
    due_to?: string;
    search?: string;
}
