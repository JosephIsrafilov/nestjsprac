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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: staticRootPath,
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
