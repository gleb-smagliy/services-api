import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthTokenService } from '../src/modules/identity/auth-token.service';
import { Identity } from '../src/modules/identity';
import { ServicesRepository } from '../src/modules/services/repositories/services.repository';

describe('ServicesController (e2e)', () => {
  let app: INestApplication;
  let testIdentity: Identity;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    await app.init();

    testIdentity = {
      id: `test-user-1`,
      tenantId: `test-tenant_${Math.floor(Math.random() * 1000000)}`,
      role: 'admin',
    };

    const authTokenService = app.get(AuthTokenService);
    authToken = await authTokenService.signToken(testIdentity);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /services', () => {
    it('should return an empty array initially', () => {
      return request(app.getHttpServer())
        .get('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect({
          meta: { total: 0 },
          data: [],
        });
    });
  });

  describe('POST /services', () => {
    it('should create a new service', () => {
      const newService = {
        name: 'Service One',
        description: 'First test service',
      };

      return request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newService)
        .expect(201)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id');
          expect(body.name).toEqual(newService.name);
          expect(body.description).toEqual(newService.description);
        });
    });

    it('should fail when required fields are missing', () => {
      const invalidService = {};

      return request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidService)
        .expect(400);
    });
  });

  function createService(name: string, description: string) {
    return app.get(ServicesRepository).createOrReplace({
      name,
      description,
      tenantId: testIdentity.tenantId,
    });
  }

  describe('GET /services/:id', () => {
    it('should retrieve the service by id', async () => {
      const service = await createService('Service One', 'First test service');

      return request(app.getHttpServer())
        .get(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', service.id);
          expect(body).toHaveProperty('name', 'Service One');
          expect(body).toHaveProperty('description', 'First test service');
        });
    });

    it('should return 404 for a non-existing service', () => {
      const nonExistingId = 'a2d24acf-4261-4bc0-8ad2-3bc5f1b6e23c';

      return request(app.getHttpServer())
        .get(`/services/${nonExistingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /services/:id', () => {
    it('should update the service details', async () => {
      const service = await createService('Service One', 'First test service');

      const updatedService = {
        name: 'Updated Service',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .put(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedService)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', service.id);
          expect(body).toHaveProperty('name', updatedService.name);
          expect(body).toHaveProperty(
            'description',
            updatedService.description,
          );
        });
    });

    it('should create a new service if it does not exist', () => {
      const nonExistingId = 'a2d24acf-4261-4bc0-8ad2-3bc5f1b6e23c';

      return request(app.getHttpServer())
        .put(`/services/${nonExistingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Did Not Exist', description: 'New service' })
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', nonExistingId);
          expect(body).toHaveProperty('name', 'Did Not Exist');
          expect(body).toHaveProperty('description', 'New service');
        });
    });
  });

  describe('DELETE /services/:id', () => {
    it('should delete the service', async () => {
      const service = await createService('Service One', 'First test service');

      return request(app.getHttpServer())
        .delete(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 when deleting the same service again', async () => {
      const service = await createService('Service One', 'First test service');

      await request(app.getHttpServer())
        .delete(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .delete(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when retrieving a deleted service', async () => {
      const service = await createService('Service One', 'First test service');

      await request(app.getHttpServer())
        .delete(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
