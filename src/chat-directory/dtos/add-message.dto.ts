import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { CHAT_UUID_REGEX } from 'src/utils/constants/chatUUIDRegex';

export class AddMessageDto {
  @IsString()
  @Matches(CHAT_UUID_REGEX, {
    message: 'That is not a valid UUID',
  })
  chatId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
