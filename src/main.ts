import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AuthTokenService } from './modules/identity/auth-token.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe that uses class-validator and class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically converts payloads to DTO instances
      whitelist: true, // Strips properties that are not part of the DTO
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
      transformOptions: {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Services API')
      .setDescription('API documentation for Services')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'jwtAuth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const authToken = await app.get(AuthTokenService).signToken({
      id: 'swagger_ui_user_id',
      tenantId: 'swagger_ui_tenant_id',
      role: 'admin',
    });

    const options = {
      swaggerOptions: {
        authAction: {
          jwtAuth: {
            name: 'jwtAuth',
            schema: {
              description: 'Default',
              type: 'http',
              in: 'header',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            value: authToken,
          },
        },
      },
    };

    SwaggerModule.setup('api', app, document, options);
  }

  await app.listen(3000);
}
bootstrap();
