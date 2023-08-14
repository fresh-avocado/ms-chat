import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatDirectoryModule } from 'src/chat-directory/chat-directory.module';

@Module({
  imports: [ChatDirectoryModule],
  providers: [ChatGateway],
})
export class ChatModule {}
