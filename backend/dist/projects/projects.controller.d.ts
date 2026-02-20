import type { CurrentUserType } from '../auth/types/current-user.type';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto, currentUser: CurrentUserType): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        name: string;
        createdAt: Date;
        id: number;
        description: string;
        createdBy: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        createdAt: Date;
        id: number;
        description: string;
        createdBy: number;
    }[]>;
}
