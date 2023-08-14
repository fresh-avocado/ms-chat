import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verifyWsConnection } from './utils/verifyWsConnection';
import { ChatDirectoryService } from 'src/chat-directory/chat-directory.service';
import { ClientSession } from 'src/redis/types/session.type';
import { AddMessageDto } from 'src/chat-directory/dtos/add-message.dto';
import { EditMessageDto } from 'src/chat-directory/dtos/edit-message.dto';
import { DeleteMessageDto } from 'src/chat-directory/dtos/delete-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  allowRequest: verifyWsConnection,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatDirectoryService: ChatDirectoryService) { }

  async handleConnection(socket: Socket) {
    const clientSession = socket.request['session'] as ClientSession;
    const chats = await this.chatDirectoryService.getChats(
      clientSession.userEmail,
    );
    chats.forEach((chat) => {
      this.logger.log(`${clientSession.userEmail} joined room ${chat.chatId}`);
      socket.join(chat.chatId);
    });
    socket.on('msg', (dto) => this.handleMessage(dto, clientSession, socket));
    socket.on('edit', (dto) => this.handleEdit(dto, clientSession, socket));
    socket.on('delete', (dto) => this.handleDelete(dto, clientSession, socket));
  }

  handleDisconnect() {
    this.logger.warn(`client disconneted`);
  }

  // ya que hemos validado la conexión, no tenemos que validar
  // cada evento, podemos confiar en la conexión. si tuvieramos que
  // validar cada evento, eso implicaría un request a Redis por evento
  // lo cual haría del chat más lento

  // estamos autenticados: el usuario conectado es de tipo ONROAD
  // por lo tanto, decidiré no validar cada payload de cada evento
  // dado que es un chat y debe ser rápido

  async handleMessage(
    dto: AddMessageDto,
    session: ClientSession,
    socket: Socket,
  ): Promise<void> {
    await this.chatDirectoryService.addMessage(dto, session);
    socket.broadcast.to(dto.chatId).emit('friendMsg', dto);
    return;
  }

  async handleEdit(
    dto: EditMessageDto,
    session: ClientSession,
    socket: Socket,
  ): Promise<void> {
    await this.chatDirectoryService.editMessage(dto, session);
    socket.broadcast.to(dto.chatId).emit('friendEdit', dto);
    return;
  }

  async handleDelete(
    dto: DeleteMessageDto,
    session: ClientSession,
    socket: Socket,
  ): Promise<void> {
    await this.chatDirectoryService.deleteMessage(dto, session);
    socket.broadcast.to(dto.chatId).emit('friendDelete', dto);
    return;
  }
}
