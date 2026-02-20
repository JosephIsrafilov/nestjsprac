import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { USER_ROLE } from '../common/constants';
import type { UserRole } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './users.dto';

type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role,
        },
      });

      return this.mapToPublicUser(user);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email is already in use');
      }

      throw error;
    }
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    return users.map((user) => this.mapToPublicUser(user));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  private mapToPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: AuthUser) {
    if (currentUser.role !== USER_ROLE.admin) {
      throw new ForbiddenException('Only admin can create users');
    }

    return this.usersService.create(dto);
  }

  @Get()
  list() {
    return this.usersService.findAll();
  }
}
