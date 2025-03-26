import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('DocumentationController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.previsaoEstudante.deleteMany();
    await prisma.historicoDados.deleteMany();
    await prisma.estudante.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();

    // Criar um usuário admin para os testes
    const adminDto = {
      email: 'admin@example.com',
      senha: 'Admin@123',
      nome: 'Admin User',
      cargo: CargoUsuario.ADMIN,
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(adminDto)
      .expect(201);

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        senha: 'Admin@123',
      })
      .expect(200);

    adminToken = adminLoginResponse.body.access_token;
  });

  describe('OpenAPI Documentation Tests', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app.getHttpServer())
        .get('/api')
        .expect(200);

      expect(response.text).toContain('swagger-ui');
      expect(response.text).toContain('swagger-ui.css');
      expect(response.text).toContain('swagger-ui-bundle.js');
    });

    it('should serve OpenAPI JSON specification', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
      expect(response.body.info).toHaveProperty('title');
      expect(response.body.info).toHaveProperty('version');
      expect(response.body.info).toHaveProperty('description');
    });

    it('should include all API endpoints in documentation', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const paths = response.body.paths;
      
      // Verificar endpoints principais
      expect(paths).toHaveProperty('/auth/login');
      expect(paths).toHaveProperty('/auth/register');
      expect(paths).toHaveProperty('/students');
      expect(paths).toHaveProperty('/insights/previsoes');
      expect(paths).toHaveProperty('/insights/historico');
      expect(paths).toHaveProperty('/insights/analise/{estudanteId}');
      expect(paths).toHaveProperty('/teams');
      expect(paths).toHaveProperty('/assessments');
      expect(paths).toHaveProperty('/interventions');
    });

    it('should include detailed schema definitions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const components = response.body.components;
      const schemas = components.schemas;

      // Verificar schemas principais
      expect(schemas).toHaveProperty('Usuario');
      expect(schemas).toHaveProperty('Estudante');
      expect(schemas).toHaveProperty('PrevisaoEstudante');
      expect(schemas).toHaveProperty('HistoricoDados');
      expect(schemas).toHaveProperty('Team');
      expect(schemas).toHaveProperty('Assessment');
      expect(schemas).toHaveProperty('Intervention');
    });

    it('should include security schemes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const components = response.body.components;
      const securitySchemes = components.securitySchemes;

      expect(securitySchemes).toHaveProperty('bearer');
      expect(securitySchemes.bearer).toHaveProperty('type', 'http');
      expect(securitySchemes.bearer).toHaveProperty('scheme', 'bearer');
      expect(securitySchemes.bearer).toHaveProperty('bearerFormat', 'JWT');
    });

    it('should include request/response examples', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const paths = response.body.paths;
      const loginPath = paths['/auth/login'];

      expect(loginPath.post).toHaveProperty('requestBody');
      expect(loginPath.post.requestBody).toHaveProperty('content');
      expect(loginPath.post.requestBody.content['application/json']).toHaveProperty('example');
      expect(loginPath.post.responses['200']).toHaveProperty('content');
      expect(loginPath.post.responses['200'].content['application/json']).toHaveProperty('example');
    });

    it('should include proper response codes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const paths = response.body.paths;
      const loginPath = paths['/auth/login'];

      expect(loginPath.post.responses).toHaveProperty('200');
      expect(loginPath.post.responses).toHaveProperty('400');
      expect(loginPath.post.responses).toHaveProperty('401');
      expect(loginPath.post.responses['200'].description).toContain('success');
      expect(loginPath.post.responses['400'].description).toContain('bad request');
      expect(loginPath.post.responses['401'].description).toContain('unauthorized');
    });

    it('should include proper parameter descriptions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const paths = response.body.paths;
      const studentPath = paths['/students/{id}'];

      expect(studentPath.get.parameters).toBeDefined();
      expect(studentPath.get.parameters[0]).toHaveProperty('name', 'id');
      expect(studentPath.get.parameters[0]).toHaveProperty('in', 'path');
      expect(studentPath.get.parameters[0]).toHaveProperty('required', true);
      expect(studentPath.get.parameters[0]).toHaveProperty('description');
    });

    it('should include proper request body schemas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const paths = response.body.paths;
      const registerPath = paths['/auth/register'];

      expect(registerPath.post.requestBody).toHaveProperty('content');
      expect(registerPath.post.requestBody.content['application/json']).toHaveProperty('schema');
      expect(registerPath.post.requestBody.content['application/json'].schema).toHaveProperty('required');
      expect(registerPath.post.requestBody.content['application/json'].schema.required).toContain('email');
      expect(registerPath.post.requestBody.content['application/json'].schema.required).toContain('senha');
      expect(registerPath.post.requestBody.content['application/json'].schema.required).toContain('nome');
    });

    it('should include proper response schemas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const paths = response.body.paths;
      const loginPath = paths['/auth/login'];

      expect(loginPath.post.responses['200']).toHaveProperty('content');
      expect(loginPath.post.responses['200'].content['application/json']).toHaveProperty('schema');
      expect(loginPath.post.responses['200'].content['application/json'].schema).toHaveProperty('type', 'object');
      expect(loginPath.post.responses['200'].content['application/json'].schema).toHaveProperty('properties');
      expect(loginPath.post.responses['200'].content['application/json'].schema.properties).toHaveProperty('access_token');
    });
  });
}); 