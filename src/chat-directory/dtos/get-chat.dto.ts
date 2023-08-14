import { IsString, Length, Matches } from 'class-validator';
import { CHAT_UUID_REGEX } from 'src/utils/constants/chatUUIDRegex';

export class GetChatDTO {
  // previene SQL Injection
  @IsString()
  @Length(36)
  @Matches(CHAT_UUID_REGEX, {
    message: 'That is not a valid UUID',
  })
  chatId: string;
}