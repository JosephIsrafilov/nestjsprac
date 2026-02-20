import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
    return users.map((u) => this.mapToPublicUser(u));
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
