import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDirectory, UserChats } from './entities/chatdirectory.entity';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { ClientSession } from 'src/redis/types/session.type';
import { stringifyError } from 'src/utils/stringifyError';
import { ChatMessage } from './types/chatMessage.type';
import { AddMessageDto } from './dtos/add-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { DeleteMessageDto } from './dtos/delete-message.dto';

@Injectable()
export class ChatDirectoryService {
  private readonly logger = new Logger(ChatDirectoryService.name);

  constructor(
    @InjectRepository(ChatDirectory)
    private readonly chatDirectoryRepository: Repository<ChatDirectory>,
  ) {}

  // podría ser más eficiente con un Promise.all([])
  // por ejemplo, buscar ambos directorios en paralelo:
  // const [charDir, friendsChatDir] = await Promise.all([find1, find2]);
  async createChat(session: ClientSession, email: string): Promise<void> {
    try {
      await this.chatDirectoryRepository.manager.transaction(
        async (entityManager) => {
          let chatDir = await entityManager.findOne(ChatDirectory, {
            where: { userEmail: session.userEmail },
          });
          if (chatDir === null) {
            const newChatDir = entityManager.create(ChatDirectory, {
              userEmail: session.userEmail,
              chats: [],
            });
            chatDir = await entityManager.save(ChatDirectory, newChatDir);
          }
          for (const chat of chatDir.chats) {
            if (chat.userEmail === email) {
              throw new HttpException(
                { msg: 'Chat already exists' },
                HttpStatus.CONFLICT,
              );
            }
          }
          const newChatId = crypto.randomUUID().replaceAll('-', '_');
          const currentDate = new Date();
          chatDir.chats.push({
            chatId: newChatId,
            userEmail: email,
            createdAt: currentDate,
            createdByMe: true,
          });
          await entityManager.update(ChatDirectory, chatDir.id, {
            chats: chatDir.chats,
          });
          let friendsChatDir = await entityManager.findOne(ChatDirectory, {
            where: { userEmail: email },
          });
          if (friendsChatDir === null) {
            const newChatDir = entityManager.create(ChatDirectory, {
              userEmail: email,
              chats: [],
            });
            friendsChatDir = await entityManager.save(
              ChatDirectory,
              newChatDir,
            );
          }
          friendsChatDir.chats.push({
            chatId: newChatId,
            userEmail: session.userEmail,
            createdAt: currentDate,
            createdByMe: false,
          });
          await entityManager.update(ChatDirectory, friendsChatDir.id, {
            chats: friendsChatDir.chats,
          });
          const newTableName = `chat_${newChatId}`;
          // crear indice en 'createdAt' para poder filtrar
          // mensajes por fecha eficientemente y para poder
          // recuperar los mensajes en el orden correcto (DESC)
          // FIXME: no sé cómo crear tablas dinámicamente en TypeORM :(
          // si hay una mejor opción no duden en avisarme
          // TODO: cambiar a author email
          await entityManager.query(`
        CREATE TABLE ${newTableName} (
          id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
          message TEXT NOT NULL,
          authorEmail TEXT NOT NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT current_timestamp,
          edited BOOLEAN NOT NULL DEFAULT FALSE,
          deleted BOOLEAN NOT NULL DEFAULT FALSE
        );
        CREATE INDEX ON ${newTableName} USING btree(createdAt);
      `);
        },
      );
    } catch (error) {
      this.logger.error(`could not create chat: ${stringifyError(error)}`);
      throw new HttpException(
        { msg: 'Could not create chat' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChats(userEmail: string): Promise<UserChats[]> {
    try {
      const chatDir = await this.chatDirectoryRepository.findOne({
        where: { userEmail },
      });
      if (chatDir === null) {
        return [];
      }
      return chatDir.chats;
    } catch (error) {
      this.logger.error(`could not get chats: ${stringifyError(error)}`);
      throw new HttpException(
        { msg: 'Could not get chats' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChat(chatId: string): Promise<ChatMessage[]> {
    try {
      // NOTE: no hay riesgo de SQL Injection por el validator
      const res = await this.chatDirectoryRepository.query(
        `SELECT * FROM chat_${chatId} ORDER BY createdAt DESC`,
      );
      this.logger.log(`${JSON.stringify(res, null, 2)}`);
      return res as ChatMessage[];
    } catch (error) {
      this.logger.error(`could not get chat: ${stringifyError(error)}`);
      throw new HttpException(
        { msg: 'Could not get chat' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addMessage(dto: AddMessageDto, session: ClientSession) {
    try {
      await this.chatDirectoryRepository.query(
        `INSERT INTO chat_${dto.chatId} (message, authorEmail) VALUES ($1, $2)`,
        [dto.message, session.userEmail],
      );
    } catch (error) {
      this.logger.error(`could not add message: ${stringifyError(error)}`);
      throw new HttpException(
        { msg: 'Could not add message' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async editMessage(dto: EditMessageDto, session: ClientSession) {
    try {
      const [, affectedRows] = await this.chatDirectoryRepository.query(
        `UPDATE chat_${dto.chatId} SET message = $1, edited = TRUE WHERE id = $2 AND authorEmail = $3`,
        [dto.newMessage, dto.messageId, session.userEmail],
      );
      if (affectedRows === 0) {
        this.logger.warn(
          `user ${session.userEmail} probably accessed the API directly`,
        );
        throw new Error(
          'message does not exist or you tried to edit a message that is not yours',
        );
      }
    } catch (error) {
      this.logger.error(`could not edit message: ${stringifyError(error)}`);
      throw new HttpException(
        { msg: 'Could not edit message' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMessage(dto: DeleteMessageDto, session: ClientSession) {
    try {
      const [, affectedRows] = await this.chatDirectoryRepository.query(
        `UPDATE chat_${dto.chatId} SET message = '', deleted = TRUE WHERE id = $1 AND authorEmail = $2`,
        [dto.messageId, session.userEmail],
      );
      if (affectedRows === 0) {
        this.logger.warn(
          `user ${session.userEmail} probably accessed the API directly`,
        );
        throw new Error(
          'message does not exist or you tried to delete a message that is not yours',
        );
      }
    } catch (error) {
      this.logger.error(`could not delete message: ${stringifyError(error)}`);
      throw new HttpException(
        { msg: 'Could not delete message' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
