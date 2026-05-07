import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const port = configService.get<number>('APP_PORT') ?? 8080;
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  // In dev, allow any origin so Swagger UI can make requests
  app.enableCors({
    origin: isDev ? '*' : frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tabelink API')
    .setDescription(
      [
        '## 🚀 Tabelink Backend REST API',
        '',
        '---',
        '',
        '📍 **Base URL:** `http://localhost:8080`  ',
        '📄 **Docs:** `http://localhost:8080/docs`',
        '',
        '---',
        '',
        '### 🔑 Luồng xác thực cơ bản',
        '',
        '1.  **POST `/auth/register`** — Tạo tài khoản mới (User hoặc Owner).',
        '',
        '2.  **POST `/auth/login`** — Đăng nhập để nhận bộ đôi `accessToken` + `refreshToken`.',
        '',
        '3.  **Authorize** — Click nút "Authorize" (ổ khóa) bên phải, dán `accessToken` vào để gọi các API bị chặn.',
        '',
        '4.  **POST `/auth/refresh`** — Sử dụng `refreshToken` để lấy token mới khi `accessToken` hết hạn (15 phút).',
        '',
        '---',
        '',
        '### 👥 Luồng khách (Guest)',
        '',
        '*   **POST `/auth/guest`** — Lấy token Guest để trải nghiệm ứng dụng mà không cần đăng ký.',
        '',
        '---',
        '',
        '### 🛠️ Luồng quên mật khẩu',
        '',
        '1.  **POST `/auth/password/forgot`** — Nhập email, hệ thống sẽ gửi link reset về mail.',
        '',
        '2.  **POST `/auth/password/reset`** — Sử dụng token nhận được từ email để đặt lại mật khẩu mới.',
        '',
        '---',
        '',
        '💡 **Lưu ý cho Developer:**',
        '> Trong môi trường **Development**, `resetToken` sẽ được trả về trực tiếp trong response của `/auth/password/forgot` để bạn có thể test nhanh mà không cần mở email.',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addServer(`http://localhost:${port}`, 'Local Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Dán accessToken nhận được từ /auth/login hoặc /auth/refresh',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', 'Xác thực, đăng ký, quên mật khẩu, hồ sơ người dùng')
    .addTag('menus', 'ID11 - Owner menu management: thêm, xem, sửa, xóa thực đơn')
    .addTag('verification', 'ID13 - Owner verification application and document upload')
    .addTag('health', 'Kiểm tra trạng thái server')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,         // Giữ token khi F5
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,             // Bật "Try it out" mặc định
    },
    customSiteTitle: 'Tabelink API Docs',
  });

  await app.listen(port);
  console.log(`\n🚀 Server:  http://localhost:${port}`);
  console.log(`📄 Swagger: http://localhost:${port}/docs\n`);
}

bootstrap();

