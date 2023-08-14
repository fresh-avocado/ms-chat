import { Validate } from 'class-validator';
import { IsOnRoadEmail } from '../decorators/isOnRoadEmail.decorator';

export class ChatDirectoryDTO {
  @Validate(IsOnRoadEmail, { message: 'User must exist and be of ONROAD type' })
  userEmail: string;
}
