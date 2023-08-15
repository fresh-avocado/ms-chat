import { Validate } from 'class-validator';
import { IsOnRoadEmail } from '../decorators/isOnRoadEmail.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDirectoryDTO {
  @ApiProperty({
    description: 'Email of the user we wish to get his or her chats from',
  })
  @Validate(IsOnRoadEmail, { message: 'User must exist and be of ONROAD type' })
  userEmail: string;
}
