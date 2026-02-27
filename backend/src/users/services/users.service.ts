import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const createdUser = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role,
        },
      });

      return this.toPublicUser(createdUser);
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new BadRequestException('Email is already in use');
      }

      throw error;
    }
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });

    return users.map((user) => this.toPublicUser(user));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async remove(userId: number, actorId: number): Promise<{ id: number }> {
    if (userId === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User was not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const ownedProjects = await tx.project.findMany({
        where: { createdBy: userId },
        select: { id: true },
      });
      const ownedProjectIds = ownedProjects.map((project) => project.id);

      await tx.taskActivity.deleteMany({
        where: {
          OR: [
            { changedBy: userId },
            { task: { assignedTo: userId } },
            ...(ownedProjectIds.length > 0
              ? [{ task: { projectId: { in: ownedProjectIds } } }]
              : []),
          ],
        },
      });

      await tx.task.deleteMany({
        where: {
          OR: [
            { assignedTo: userId },
            ...(ownedProjectIds.length > 0
              ? [{ projectId: { in: ownedProjectIds } }]
              : []),
          ],
        },
      });

      await tx.project.deleteMany({
        where: { createdBy: userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { id: userId };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
