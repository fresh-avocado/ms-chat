import { Module } from '@nestjs/common';
import { ChatDirectoryController } from './chat-directory.controller';
import { ChatDirectoryService } from './chat-directory.service';
import { ChatDirectory } from './entities/chatdirectory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatDirectory]), UsersModule],
  controllers: [ChatDirectoryController],
  providers: [ChatDirectoryService],
  exports: [ChatDirectoryService],
})
export class ChatDirectoryModule {}
