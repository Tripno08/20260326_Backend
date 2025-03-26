import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('UsersController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();

    // Criar um usuário admin para os testes
    const registerDto = {
      email: 'admin@example.com',
      senha: 'Admin@123',
      nome: 'Admin User',
      cargo: CargoUsuario.ADMIN,
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        senha: 'Admin@123',
      })
      .expect(200);

    adminToken = loginResponse.body.access_token;
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      // Criar alguns usuários de teste
      const users = [
        {
          email: 'professor@example.com',
          senha: 'Test@123',
          nome: 'Professor Test',
          cargo: CargoUsuario.PROFESSOR,
        },
        {
          email: 'especialista@example.com',
          senha: 'Test@123',
          nome: 'Especialista Test',
          cargo: CargoUsuario.ESPECIALISTA,
        },
      ];

      for (const user of users) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(user)
          .expect(201);
      }
    });

    it('should list all users when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('nome');
          expect(res.body[0]).toHaveProperty('cargo');
          expect(res.body[0]).not.toHaveProperty('senha');
        });
    });

    it('should not list users without authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });

    it('should filter users by cargo', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({ cargo: CargoUsuario.PROFESSOR })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(user => user.cargo === CargoUsuario.PROFESSOR)).toBe(true);
        });
    });
  });

  describe('GET /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      userId = response.body.id;
    });

    it('should get user by id when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).toHaveProperty('nome', 'Test User');
          expect(res.body).toHaveProperty('cargo', CargoUsuario.PROFESSOR);
          expect(res.body).not.toHaveProperty('senha');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get user without authentication', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401);
    });
  });

  describe('PATCH /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      userId = response.body.id;
    });

    it('should update user when authenticated as admin', () => {
      const updateDto = {
        nome: 'Updated Name',
        cargo: CargoUsuario.ESPECIALISTA,
      };

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body.nome).toBe(updateDto.nome);
          expect(res.body.cargo).toBe(updateDto.cargo);
          expect(res.body).not.toHaveProperty('senha');
        });
    });

    it('should not update user without authentication', () => {
      const updateDto = {
        nome: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 for non-existent user', () => {
      const updateDto = {
        nome: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        senha: 'Test@123',
        nome: 'Test User',
        cargo: CargoUsuario.PROFESSOR,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      userId = response.body.id;
    });

    it('should delete user when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).toHaveProperty('nome', 'Test User');
          expect(res.body).not.toHaveProperty('senha');
        });
    });

    it('should not delete user without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(401);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 