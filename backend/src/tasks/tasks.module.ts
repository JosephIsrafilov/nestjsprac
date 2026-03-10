import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [RealtimeModule, NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService, JwtAuthGuard, RolesGuard],
})
export class TasksModule {}
