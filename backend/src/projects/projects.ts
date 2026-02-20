import {
  Body,
  Controller,
  Get,
  Injectable,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './projects.dto';

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

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() currentUser: AuthUser) {
    return this.projectsService.create(dto, currentUser.id);
  }

  @Get()
  list() {
    return this.projectsService.list();
  }
}
