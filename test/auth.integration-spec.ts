import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('AuthController (e2e)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(registerDto.email);
          expect(res.body.nome).toBe(registerDto.nome);
          expect(res.body.cargo).toBe(registerDto.cargo);
          expect(res.body).not.toHaveProperty('senha');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });

    it('should not allow duplicate emails', async () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('should login with valid credentials', () => {
      const loginDto = {
        email: 'test@example.com',
        senha: 'Test@123',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(loginDto.email);
          expect(res.body.user).not.toHaveProperty('senha');
        });
    });

    it('should not login with invalid credentials', () => {
      const loginDto = {
        email: 'test@example.com',
        senha: 'WrongPassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'Test@123',
        })
        .expect(200);

      accessToken = loginResponse.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.nome).toBe('Test User');
          expect(res.body).not.toHaveProperty('senha');
        });
    });

    it('should not get profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should not get profile with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
}); 