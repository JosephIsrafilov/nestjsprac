import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { CurrentUserType } from '../../auth/types/current-user.type';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectsService } from '../services/projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.projectsService.create(dto, currentUser.id);
  }

  @Get()
  list() {
    return this.projectsService.list();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  remove(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectsService.remove(projectId);
  }
}
