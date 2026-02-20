import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
