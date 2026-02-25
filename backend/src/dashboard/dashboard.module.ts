import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard],
})
export class DashboardModule {}
