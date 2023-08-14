import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { CHAT_UUID_REGEX } from 'src/utils/constants/chatUUIDRegex';

export class EditMessageDto {
  @IsString()
  @Matches(CHAT_UUID_REGEX, {
    message: 'That is not a valid UUID',
  })
  chatId: string;

  @IsUUID()
  messageId: string;

  @IsString()
  @IsNotEmpty()
  newMessage: string;
}
