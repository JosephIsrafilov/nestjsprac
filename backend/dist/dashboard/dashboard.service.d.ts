import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        byStatus: {
            status: import("@prisma/client").$Enums.TaskStatus;
            count: number;
        }[];
        byProject: {
            project_id: number;
            project_name: string;
            count: number;
        }[];
        byUser: {
            user_id: number;
            user_name: string;
            count: number;
        }[];
    }>;
}
