import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtAuthGuard],
})
export class ProjectsModule {}
