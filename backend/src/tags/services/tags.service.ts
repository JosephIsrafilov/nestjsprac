import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { CreateTagDto } from '../dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  list() {
    return this.prisma.tag.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  async create(dto: CreateTagDto) {
    try {
      const tag = await this.prisma.tag.create({
        data: {
          name: dto.name.trim(),
          color: dto.color ?? '#64748b',
        },
      });

      this.realtimeGateway.broadcastTagCreated(tag);

      return tag;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Tag name is already in use');
      }

      throw error;
    }
  }
}
