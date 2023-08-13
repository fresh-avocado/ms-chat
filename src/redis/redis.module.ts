import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './constants/constants';

export type RedisClient = ReturnType<typeof createClient>;

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisUser = configService.get<string>('REDIS_USER');
        const redisPass = configService.get<string>('REDIS_PASS');
        const redisPort = +configService.get<number>('REDIS_PORT');
        const client = createClient({
          url: `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}/0`,
        });
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
