import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verifyWsConnection } from './utils/verifyWsConnection';
import { ClientSession } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  allowRequest: verifyWsConnection,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor() { }

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    const session = socket.request['session'] as ClientSession;
    this.logger.log(`session: ${JSON.stringify(session, null, 2)}`);
    // const session = await this.redisService.getSession(cookieStr.value);
  }

  handleDisconnect() {
    this.logger.warn(`client disconneted`);
  }

  @SubscribeMessage('msg')
  findAll(@MessageBody() data: any): Promise<WsResponse<any>> {
    this.logger.log(`data: ${JSON.stringify(data, null, 2)}`);
    this.server.emit('oh yes oh yes', 'said carl cox');
    return data;
  }
}
