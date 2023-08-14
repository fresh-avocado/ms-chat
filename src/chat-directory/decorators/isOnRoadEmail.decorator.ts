import { Injectable, Logger } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from 'src/users/users.service';
import { stringifyError } from 'src/utils/stringifyError';
import { User } from 'src/users/entities/user.entity';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsOnRoadEmail implements ValidatorConstraintInterface {
  private readonly logger = new Logger(IsOnRoadEmail.name);

  constructor(private readonly userService: UsersService) {}

  async validate(email: string): Promise<boolean> {
    try {
      const user: User | null = await this.userService.getUser(email);
      if (user === null) {
        return false;
      }
      if (user.type === 'normal') {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(
        `error finding user in @IsOnRoadEmail: ${stringifyError(error)}`,
      );
      return false;
    }
  }
}
