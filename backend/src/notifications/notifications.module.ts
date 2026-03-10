import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationsProcessor } from './processors/notifications.processor';
import { EmailService } from './services/email.service';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [EmailService, NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
