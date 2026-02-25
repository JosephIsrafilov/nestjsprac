import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto, createdBy: number) {
    const data = {
      name: dto.name,
      description: dto.description,
      createdBy,
    };

    return this.prisma.project.create({
      data,
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
}
