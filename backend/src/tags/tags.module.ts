import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RealtimeModule } from '../realtime/realtime.module';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';

@Module({
  imports: [RealtimeModule],
  controllers: [TagsController],
  providers: [TagsService, JwtAuthGuard],
  exports: [TagsService],
})
export class TagsModule {}
