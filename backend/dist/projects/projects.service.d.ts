import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './projects.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto, createdBy: number): import("@prisma/client").Prisma.Prisma__ProjectClient<{
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
