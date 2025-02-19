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

describe('VersionsController (e2e)', () => {
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
      id: 'test-user-1',
      tenantId: `test-tenant_${Date.now()}`,
      role: 'admin',
    };

    const authTokenService = app.get(AuthTokenService);
    authToken = await authTokenService.signToken(testIdentity);
  });

  afterEach(async () => {
    await app.close();
  });

  function createService(name: string, description: string) {
    return app.get(ServicesRepository).createOrReplace({
      name,
      description,
      tenantId: testIdentity.tenantId,
    });
  }

  function createVersion(serviceId: string, name: string, description: string) {
    return request(app.getHttpServer())
      .post(`/services/${serviceId}/versions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name, description })
      .expect(201)
      .then((response) => response.body);
  }

  describe('GET /services/:serviceId/versions', () => {
    it('should return an empty array initially', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );

      return request(app.getHttpServer())
        .get(`/services/${service.id}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect({
          meta: { total: 0 },
          data: [],
        });
    });
  });

  describe('POST /services/:serviceId/versions', () => {
    it('should create a new version', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );

      const newVersion = {
        name: 'v1.0',
        description: 'Initial release',
      };

      return request(app.getHttpServer())
        .post(`/services/${service.id}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newVersion)
        .expect(201)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id');
          expect(body.name).toEqual(newVersion.name);
          expect(body.description).toEqual(newVersion.description);
        });
    });

    it('should fail when required fields are missing', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );

      return request(app.getHttpServer())
        .post(`/services/${service.id}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /services/:serviceId/versions/:id', () => {
    it('should retrieve the version by id', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const version = await createVersion(
        service.id,
        'v1.0',
        'Initial release',
      );

      return request(app.getHttpServer())
        .get(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', version.id);
          expect(body).toHaveProperty('name', 'v1.0');
          expect(body).toHaveProperty('description', 'Initial release');
        });
    });

    it('should return 404 for a non-existing version', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const nonExistingId = 'a2d24acf-4261-4bc0-8ad2-3bc5f1b6e23c';

      return request(app.getHttpServer())
        .get(`/services/${service.id}/versions/${nonExistingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /services/:serviceId/versions/:id', () => {
    it('should update the version details', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const version = await createVersion(
        service.id,
        'v1.0',
        'Initial release',
      );

      const updatedVersion = {
        name: 'v1.1',
        description: 'Minor update',
      };

      return request(app.getHttpServer())
        .patch(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedVersion)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', version.id);
          expect(body).toHaveProperty('name', updatedVersion.name);
          expect(body).toHaveProperty(
            'description',
            updatedVersion.description,
          );
        });
    });
  });

  describe('PUT /services/:serviceId/versions/:id', () => {
    it('should update the version if it exists', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const version = await createVersion(
        service.id,
        'v1.0',
        'Initial release',
      );

      const updatedData = {
        name: 'v2.0',
        description: 'Major update',
      };

      return request(app.getHttpServer())
        .put(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', version.id);
          expect(body).toHaveProperty('name', updatedData.name);
          expect(body).toHaveProperty('description', updatedData.description);
        });
    });

    it('should create a new version if it does not exist', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const nonExistingId = 'a2d24acf-4261-4bc0-8ad2-3bc5f1b6e23c';

      const newVersionData = {
        name: 'v1.0',
        description: 'Initial release',
      };

      return request(app.getHttpServer())
        .put(`/services/${service.id}/versions/${nonExistingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newVersionData)
        .expect(200)
        .then((response) => {
          const body = response.body;
          expect(body).toHaveProperty('id', nonExistingId);
          expect(body).toHaveProperty('name', newVersionData.name);
          expect(body).toHaveProperty(
            'description',
            newVersionData.description,
          );
        });
    });
  });

  describe('DELETE /services/:serviceId/versions/:id', () => {
    it('should delete the version', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const version = await createVersion(
        service.id,
        'v1.0',
        'Initial release',
      );

      return request(app.getHttpServer())
        .delete(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 when deleting the same version again', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const version = await createVersion(
        service.id,
        'v1.0',
        'Initial release',
      );

      await request(app.getHttpServer())
        .delete(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .delete(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when retrieving a deleted version', async () => {
      const service = await createService(
        'Test Service',
        'Test service description',
      );
      const version = await createVersion(
        service.id,
        'v1.0',
        'Initial release',
      );

      await request(app.getHttpServer())
        .delete(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/services/${service.id}/versions/${version.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
