import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { AllowedUserType } from 'src/guards/auth/decorators/role.decorator';
import { ChatDirectoryDTO } from './dtos/chat-directory.dto';
import { ChatDirectoryService } from './chat-directory.service';
import { FastifyRequest } from 'fastify';
import { ClientSession } from 'src/redis/types/session.type';
import { GetChatDTO } from './dtos/get-chat.dto';
import { AddMessageDto } from './dtos/add-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { DeleteMessageDto } from './dtos/delete-message.dto';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('chatDirectory')
export class ChatDirectoryController {
  constructor(private readonly chatDirectoryService: ChatDirectoryService) {}

  @ApiOperation({ summary: 'Creates a chat with another onroad user' })
  @ApiCreatedResponse({
    description: 'The chat between both users was created successfully',
  })
  @AllowedUserType('onroad')
  @UseGuards(AuthGuard)
  @Post('/create')
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: ChatDirectoryDTO,
    @Req() req: FastifyRequest & { session: ClientSession; sessionId: string },
  ) {
    return await this.chatDirectoryService.createChat(
      req.session,
      dto.userEmail,
    );
  }

  @ApiOperation({ summary: 'Gets chats the current user has' })
  @ApiOkResponse({ description: 'Chats for the current user were returned' })
  @AllowedUserType('onroad')
  @UseGuards(AuthGuard)
  @Get('/getChats')
  @UsePipes(ValidationPipe)
  async getChats(
    @Req() req: FastifyRequest & { session: ClientSession; sessionId: string },
  ) {
    return await this.chatDirectoryService.getChats(req.session.userEmail);
  }

  @ApiOperation({ summary: 'Gets the messages of the requested chat' })
  @ApiCreatedResponse({
    description: 'The messages of the requested chat were returned',
  })
  @AllowedUserType('onroad')
  @UseGuards(AuthGuard)
  @Post('/getChat')
  @UsePipes(ValidationPipe)
  async getChat(@Body() dto: GetChatDTO) {
    return await this.chatDirectoryService.getChat(dto.chatId);
  }

  @ApiOperation({ summary: 'Adds a message to a chat' })
  @ApiCreatedResponse({
    description: 'The message has been added to the chat',
  })
  @AllowedUserType('onroad')
  @UseGuards(AuthGuard)
  @Post('/addMessage')
  @UsePipes(ValidationPipe)
  async addMessage(
    @Body() dto: AddMessageDto,
    @Req() req: FastifyRequest & { sessionId: string; session: ClientSession },
  ) {
    return await this.chatDirectoryService.addMessage(dto, req.session);
  }

  @ApiOperation({ summary: 'Edits a message in a chat' })
  @ApiCreatedResponse({
    description: 'The message has been edited',
  })
  @AllowedUserType('onroad')
  @UseGuards(AuthGuard)
  @Put('/editMessage')
  @UsePipes(ValidationPipe)
  async editMessage(
    @Body() dto: EditMessageDto,
    @Req() req: FastifyRequest & { sessionId: string; session: ClientSession },
  ) {
    return await this.chatDirectoryService.editMessage(dto, req.session);
  }

  @ApiOperation({ summary: 'Deletes a message in a chat' })
  @ApiCreatedResponse({
    description: 'The message has been deleted',
  })
  @AllowedUserType('onroad')
  @UseGuards(AuthGuard)
  @Delete('/deleteMessage')
  @UsePipes(ValidationPipe)
  async deleteMessage(
    @Body() dto: DeleteMessageDto,
    @Req() req: FastifyRequest & { sessionId: string; session: ClientSession },
  ) {
    return await this.chatDirectoryService.deleteMessage(dto, req.session);
  }
}
