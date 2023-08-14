import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatDirectoryModule } from './chat-directory/chat-directory.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { IsOnRoadEmail } from './chat-directory/decorators/isOnRoadEmail.decorator';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: +configService.get<number>('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DATABASE'),
          entities: [],
          synchronize: true,
          logging: true,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    ChatDirectoryModule,
    RedisModule,
    UsersModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsOnRoadEmail],
})
export class AppModule {}
