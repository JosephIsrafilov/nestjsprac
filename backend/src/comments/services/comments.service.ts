import { Injectable, NotFoundException } from '@nestjs/common';
import type { CurrentUserType } from '../../auth/types/current-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async list(taskId: number) {
    await this.ensureTaskExists(taskId);

    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async create(
    taskId: number,
    dto: CreateCommentDto,
    currentUser: CurrentUserType,
  ) {
    await this.ensureTaskExists(taskId);

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        taskId,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    this.realtimeGateway.broadcastCommentCreated({
      taskId,
      comment,
    });

    return comment;
  }

  private async ensureTaskExists(taskId: number): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task was not found');
    }
  }
}
