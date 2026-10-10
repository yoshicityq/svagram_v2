import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly configService: ConfigService) {}

  @WebSocketServer()
  server!: Server;

  sendToUser(userId: number, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  afterInit(server: Server) {
    this.server.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const payload = this.verifyJwtToken(token);
        socket.data.user = payload;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }
  handleConnection(client: Socket) {
    try {
      const userId = client.data.user.sub;
      client.join(`user:${userId}`);
      console.log(`User ${userId} connected`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user.sub;

    if (!userId) return;

    const room = this.server.sockets.adapter.rooms.get(`user:${userId}`);
    const isOnline = !!room?.size;

    this.server.emit('online_change', { userId, isOnline });
  }

  @SubscribeMessage('online_check')
  checkUserOnline(@MessageBody() { userId }: { userId: string }) {
    const userRoom = `user:${userId}`;
    const sockets = this.server.sockets.adapter.rooms.get(userRoom);
    return { isOnline: !!sockets?.size };
  }

  verifyJwtToken(token: string) {
    try {
      const payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      );
      return payload;
    } catch (e) {
      throw new UnauthorizedException(`Access token is invalid`);
    }
  }
}
