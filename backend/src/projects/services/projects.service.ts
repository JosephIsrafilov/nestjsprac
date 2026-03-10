import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto, createdBy: number) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdBy,
      },
    });
  }

  list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdBy: true,
        createdAt: true,
      },
    });
  }

  async remove(projectId: number): Promise<{ id: number }> {
    const exists = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Project was not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.taskActivity.deleteMany({ where: { task: { projectId } } });
      await tx.task.deleteMany({
        where: { projectId },
      });

      await tx.project.delete({
        where: { id: projectId },
      });
    });

    return { id: projectId };
  }
}
