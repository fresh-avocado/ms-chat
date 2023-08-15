import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { CHAT_UUID_REGEX } from 'src/utils/constants/chatUUIDRegex';

export class EditMessageDto {
  @ApiProperty()
  @IsString()
  @Matches(CHAT_UUID_REGEX, {
    message: 'That is not a valid UUID',
  })
  chatId: string;

  @ApiProperty({
    description: 'ID of the message we wish to edit',
  })
  @IsUUID()
  messageId: string;

  @ApiProperty({
    description: 'New content of the message',
  })
  @IsString()
  @IsNotEmpty()
  newMessage: string;
}
