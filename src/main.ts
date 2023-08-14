import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const config = app.get(ConfigService);
  await app.register(fastifyCookie, {
    secret: config.get<string>('COOKIE_SECRET'),
  });
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
