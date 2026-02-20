import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

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
      orderBy: { id: 'asc' },
    });
  }
}
