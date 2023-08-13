import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { RedisService } from 'src/redis/redis.service';
import { Role } from './types/role.type';
import {
  MALFORMED_SESSION_COOKIE,
  NOT_SIGNED_IN,
  UNAUTHORIZED,
} from 'src/utils/constants/errorMessages';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as FastifyRequest;

    const signedCookieValue = req.cookies['sessionId'];

    if (signedCookieValue === null || signedCookieValue === undefined) {
      throw new HttpException({ msg: NOT_SIGNED_IN }, HttpStatus.UNAUTHORIZED);
    }

    const sessionIdObj = req.unsignCookie(signedCookieValue);

    if (sessionIdObj.valid === false) {
      throw new HttpException(
        { msg: MALFORMED_SESSION_COOKIE },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sessionId = sessionIdObj.value;

    const session = await this.redis.getSession(sessionId);

    this.logger.log(`SESSION: ${JSON.stringify(session, null, 2)}`);

    const role = this.reflector.get<Role>('role', context.getHandler());

    if (role !== 'any' && session.userType !== role) {
      throw new HttpException({ msg: UNAUTHORIZED }, HttpStatus.UNAUTHORIZED);
    }

    // NOTE: to prevent unsigning the cookie and fetching the session twice:

    // eslint-disable-next-line
    // @ts-ignore
    req.session = session;
    // eslint-disable-next-line
    // @ts-ignore
    req.sessionId = sessionId;

    return true;
  }
}
