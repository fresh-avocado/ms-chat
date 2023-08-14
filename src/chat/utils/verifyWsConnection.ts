import { Signer } from '@fastify/cookie';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncomingMessage } from 'http';
import { unescape } from 'querystring';
import { createClient } from 'redis';
import { ClientSession } from 'src/redis/types/session.type';
import { UserType } from 'src/users/enums/userType';
import { stringifyError } from 'src/utils/stringifyError';

/*
  NOTA:
    Lamentablemente, tuve que establecer otra conexión a Redis.
    El decorador "@WebSocketGateway" toma una FUNCION como parámetro
    para autenticar requests y hasta ahora no encontré manera de
    injectar RedisService a una función. Si ustedes saben, me encantaría
    saberlo. Por ello, tuve que establecer la conexión dos veces. Sé que
    no es una buena práctica, pero en mi caso no tuve otra opción.

    Por otro lado, esto es mejor dado que el socket que mantiene la conexión
    con Redis ya no se va a abrumar: la carga se distribuirá. Algo así como
    mantener un 'connection pool' a un BD en vez de una sola conexión. No sé
    si Redis hace eso por debajo. En dicho caso, no hay 'performance gain' entonces.
*/

const logger = new Logger('verifyWsConnection');
let redisConn: ReturnType<typeof createClient> = null;
let cookieSecret: string;
let signer: Signer;

const getRedisConnection = async (): Promise<void> => {
  if (redisConn === null) {
    const configService = new ConfigService();
    const redisHost = configService.get<string>('REDIS_HOST');
    const redisUser = configService.get<string>('REDIS_USER');
    const redisPass = configService.get<string>('REDIS_PASS');
    const redisPort = +configService.get<number>('REDIS_PORT');
    const client = createClient({
      url: `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}/0`,
    });
    await client.connect();
    redisConn = client;
    cookieSecret = configService.get<string>('COOKIE_SECRET');
    signer = new Signer(cookieSecret);
  }
};

export const verifyWsConnection = async (
  req: IncomingMessage & { session: ClientSession },
  fn: (err: string | null | undefined, success: boolean) => void,
): Promise<void> => {
  await getRedisConnection();
  try {
    const idx = req.rawHeaders.indexOf('Cookie');
    if (idx === -1) {
      logger.error('No cookie header present');
      fn('No cookie header present', false);
      return;
    }
    const sessionCookieValue = extractCookieValue(req.rawHeaders[idx + 1]);
    const unsignedCookie = signer.unsign(unescape(sessionCookieValue));
    if (!unsignedCookie.valid) {
      logger.error('Malformed cookie');
      fn('Malformed cookie', false);
      return;
    }
    const session = JSON.parse(
      await redisConn.get(unsignedCookie.value),
    ) as ClientSession;
    if (session === null) {
      logger.error('Unauthenticated');
      fn('Unauthenticated', false);
      return;
    }
    if (session.userType !== UserType.ON_ROAD) {
      logger.error('Unauthorized');
      fn('Unauthorized', false);
      return;
    }
    req.session = session;
    fn(null, true);
  } catch (error) {
    // for example, an index out of bounds
    logger.error(`${stringifyError(error)}`);
    fn('An error occurred', false);
  }
};

const extractCookieValue = (cookieString: string): string => {
  const cookies = cookieString.split('; ');
  let sessionCookieValue: string = '';
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].includes('sessionId')) {
      sessionCookieValue = cookies[i].split('=')[1];
      break;
    }
  }
  return sessionCookieValue;
};
