import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import {
  OnGatewayInit,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};

type RealtimeEventName =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'comment.created'
  | 'tag.created';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server): void {
    server.use(async (client, next) => {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(
          this.extractToken(client),
        );

        client.data.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };

        next();
      } catch (error) {
        this.logger.warn(
          `Rejected websocket client ${client.id}: ${(error as Error).message}`,
        );
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(_client: Socket): void {
    return;
  }

  broadcastTaskCreated(task: unknown): void {
    this.emit('task.created', task);
  }

  broadcastTaskUpdated(task: unknown): void {
    this.emit('task.updated', task);
  }

  broadcastTaskDeleted(taskId: number): void {
    this.emit('task.deleted', { id: taskId });
  }

  broadcastCommentCreated(payload: unknown): void {
    this.emit('comment.created', payload);
  }

  broadcastTagCreated(tag: unknown): void {
    this.emit('tag.created', tag);
  }

  private emit(type: RealtimeEventName, payload: unknown): void {
    this.server.emit(type, {
      type,
      payload,
      timestamp: new Date().toISOString(),
    });
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth.token;
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;
    if (
      typeof authorizationHeader === 'string' &&
      authorizationHeader.startsWith('Bearer ')
    ) {
      return authorizationHeader.slice('Bearer '.length);
    }

    throw new UnauthorizedException('Missing websocket token');
  }
}
