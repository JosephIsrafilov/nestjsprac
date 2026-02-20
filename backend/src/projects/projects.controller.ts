import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { CurrentUser } from '../auth/auth.dto';
import { CurrentUserData } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './projects.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUserData() currentUser: CurrentUser,
  ) {
    return this.projectsService.create(dto, currentUser.id);
  }

  @Get()
  list() {
    return this.projectsService.list();
  }
}
