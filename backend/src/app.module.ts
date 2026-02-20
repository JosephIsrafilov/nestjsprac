import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'ui'),
      serveRoot: '/ui',
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_super_secret_change_me',
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
