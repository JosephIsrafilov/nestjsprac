import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { DashboardController, DashboardService } from './dashboard/dashboard';
import { PrismaService } from './prisma/prisma.service';
import { ProjectsController, ProjectsService } from './projects/projects';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { UsersController, UsersService } from './users/users';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

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
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    ProjectsController,
    TasksController,
    DashboardController,
  ],
  providers: [
    PrismaService,
    AuthService,
    UsersService,
    ProjectsService,
    TasksService,
    DashboardService,
    JwtStrategy,
    JwtAuthGuard,
  ],
})
export class AppModule {}
