import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { RealtimeModule } from './realtime/realtime.module';
import { TagsModule } from './tags/tags.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

const staticPathCandidates = [
  join(process.cwd(), 'frontend', 'dist'),
  join(process.cwd(), '..', 'frontend', 'dist'),
  join(__dirname, '..', '..', '..', 'frontend', 'dist'),
  join(process.cwd(), 'ui'),
  join(process.cwd(), '..', 'ui'),
];

const staticRootPath =
  staticPathCandidates.find((candidate) => existsSync(candidate)) ??
  join(process.cwd(), '..', 'frontend', 'dist');

function buildRedisConfig() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB ?? 0),
    };
  }

  const parsed = new URL(redisUrl);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    password: parsed.password || undefined,
    db: parsed.pathname ? Number(parsed.pathname.slice(1) || 0) : 0,
  };
}

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: staticRootPath,
      serveRoot: '/ui',
    }),
    BullModule.forRoot({
      redis: buildRedisConfig(),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    DashboardModule,
    RealtimeModule,
    NotificationsModule,
    CommentsModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
