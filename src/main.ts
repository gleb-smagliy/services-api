import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AuthTokenService } from './modules/identity/auth-token.service';
import { DataSource } from 'typeorm';
import { AppDataSource } from './modules/database/data-source';

async function bootstrapApp() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
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

  if (true) {
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

async function bootstrapDb() {
  // const app = await NestFactory.createApplicationContext(AppModule);
  // const dataSource = app.get(DataSource);
  // // await dataSource.initialize();
  // await dataSource.runMigrations();

  console.log('=== process.env.NODE_ENV ===', process.env.NODE_ENV);

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
}

async function bootstrap() {
  try {
    if (process.argv.includes('migrate')) {
      console.log('===Running migrations ===');
      await bootstrapDb();
    } else {
      console.log('=== Starting application ===');
      await bootstrapApp();
    }
  } catch (err) {
    console.error('Error starting application', err);

    process.exit(1);
  }
}

bootstrap();
