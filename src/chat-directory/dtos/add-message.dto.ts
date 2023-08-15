import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { CHAT_UUID_REGEX } from 'src/utils/constants/chatUUIDRegex';

export class AddMessageDto {
  @ApiProperty({ description: 'ID of the chat we will add the message to' })
  @IsString()
  @Matches(CHAT_UUID_REGEX, {
    message: 'That is not a valid UUID',
  })
  chatId: string;

  @ApiProperty({ description: 'Text of the message we will add to the chat' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
