import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const port = configService.get<number>('APP_PORT') ?? 8080;

  app.enableCors({
    origin: frontendUrl,
  });

  await app.listen(port);
}

bootstrap();
