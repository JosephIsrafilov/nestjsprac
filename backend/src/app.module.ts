import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

const uiPathCandidates = [
  join(process.cwd(), 'ui'),
  join(process.cwd(), '..', 'ui'),
  join(__dirname, '..', '..', 'ui'),
  join(__dirname, '..', '..', '..', 'ui'),
];

const uiRootPath =
  uiPathCandidates.find((candidate) => existsSync(candidate)) ??
  join(process.cwd(), '..', 'ui');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: uiRootPath,
      serveRoot: '/ui',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
