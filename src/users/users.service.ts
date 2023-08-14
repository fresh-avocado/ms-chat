import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { stringifyError } from 'src/utils/stringifyError';
import { GET_USER_ERROR } from 'src/utils/constants/errorMessages';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUser(email: string): Promise<User | null> {
    try {
      const user: User | null = await this.userRepository.findOne({
        select: {
          type: true,
        },
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(`error finding user: ${stringifyError(error)}`);
      throw new Error(GET_USER_ERROR);
    }
  }
}
