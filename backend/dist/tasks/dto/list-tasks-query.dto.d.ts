import { TaskStatus } from '@prisma/client';
export declare class ListTasksQueryDto {
    status?: TaskStatus;
    assigned_to?: number;
    due_from?: string;
    due_to?: string;
    search?: string;
}
