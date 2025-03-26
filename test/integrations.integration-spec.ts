import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { Plataforma } from '@prisma/client';

describe('IntegrationsController (e2e)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.integracaoPlataforma.deleteMany();
  });

  describe('POST /integrations', () => {
    it('should create a new integration', () => {
      const createDto = {
        nome: 'Test Integration',
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'https://test.com/callback',
        escopos: 'test-scopes',
      };

      return request(app.getHttpServer())
        .post('/integrations')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nome).toBe(createDto.nome);
          expect(res.body.plataforma).toBe(createDto.plataforma);
          expect(res.body.clientId).toBe(createDto.clientId);
          expect(res.body.ativo).toBe(true);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/integrations')
        .send({})
        .expect(400);
    });
  });

  describe('GET /integrations', () => {
    beforeEach(async () => {
      await prisma.integracaoPlataforma.create({
        data: {
          nome: 'Test Integration',
          plataforma: Plataforma.GOOGLE_CLASSROOM,
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'https://test.com/callback',
          escopos: 'test-scopes',
        },
      });
    });

    it('should return all integrations', () => {
      return request(app.getHttpServer())
        .get('/integrations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0].nome).toBe('Test Integration');
        });
    });

    it('should filter by active status', () => {
      return request(app.getHttpServer())
        .get('/integrations?ativo=true')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((item) => item.ativo === true)).toBe(true);
        });
    });
  });

  describe('GET /integrations/:id', () => {
    let integrationId: string;

    beforeEach(async () => {
      const integration = await prisma.integracaoPlataforma.create({
        data: {
          nome: 'Test Integration',
          plataforma: Plataforma.GOOGLE_CLASSROOM,
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'https://test.com/callback',
          escopos: 'test-scopes',
        },
      });
      integrationId = integration.id;
    });

    it('should return a single integration', () => {
      return request(app.getHttpServer())
        .get(`/integrations/${integrationId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', integrationId);
          expect(res.body.nome).toBe('Test Integration');
        });
    });

    it('should return 404 for non-existent integration', () => {
      return request(app.getHttpServer())
        .get('/integrations/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /integrations/:id', () => {
    let integrationId: string;

    beforeEach(async () => {
      const integration = await prisma.integracaoPlataforma.create({
        data: {
          nome: 'Test Integration',
          plataforma: Plataforma.GOOGLE_CLASSROOM,
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'https://test.com/callback',
          escopos: 'test-scopes',
        },
      });
      integrationId = integration.id;
    });

    it('should update an integration', () => {
      const updateDto = {
        nome: 'Updated Integration',
        ativo: false,
      };

      return request(app.getHttpServer())
        .patch(`/integrations/${integrationId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.nome).toBe(updateDto.nome);
          expect(res.body.ativo).toBe(updateDto.ativo);
        });
    });

    it('should return 404 for non-existent integration', () => {
      return request(app.getHttpServer())
        .patch('/integrations/non-existent-id')
        .send({ nome: 'Updated Integration' })
        .expect(404);
    });
  });

  describe('DELETE /integrations/:id', () => {
    let integrationId: string;

    beforeEach(async () => {
      const integration = await prisma.integracaoPlataforma.create({
        data: {
          nome: 'Test Integration',
          plataforma: Plataforma.GOOGLE_CLASSROOM,
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'https://test.com/callback',
          escopos: 'test-scopes',
        },
      });
      integrationId = integration.id;
    });

    it('should remove an integration', () => {
      return request(app.getHttpServer())
        .delete(`/integrations/${integrationId}`)
        .expect(200)
        .expect(async () => {
          const deleted = await prisma.integracaoPlataforma.findUnique({
            where: { id: integrationId },
          });
          expect(deleted).toBeNull();
        });
    });

    it('should return 404 for non-existent integration', () => {
      return request(app.getHttpServer())
        .delete('/integrations/non-existent-id')
        .expect(404);
    });
  });
}); 