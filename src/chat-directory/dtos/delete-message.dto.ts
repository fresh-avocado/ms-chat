import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';
import { CHAT_UUID_REGEX } from 'src/utils/constants/chatUUIDRegex';

export class DeleteMessageDto {
  @ApiProperty({
    description: 'ID of the chat we wish to delete the message from',
  })
  @IsString()
  @Matches(CHAT_UUID_REGEX, {
    message: 'That is not a valid UUID',
  })
  chatId: string;

  @ApiProperty({
    description: 'ID of the message we wish to delete',
  })
  @IsUUID()
  messageId: string;
}
