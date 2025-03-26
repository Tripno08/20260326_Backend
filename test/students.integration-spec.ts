import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('StudentsController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;
  let professorToken: string;
  let professorId: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.estudante.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();
    await prisma.instituicao.deleteMany();

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

    // Criar um usuário professor para os testes
    const professorDto = {
      email: 'professor@example.com',
      senha: 'Test@123',
      nome: 'Professor Test',
      cargo: CargoUsuario.PROFESSOR,
    };

    const professorResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(professorDto)
      .expect(201);

    professorId = professorResponse.body.id;

    const professorLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'professor@example.com',
        senha: 'Test@123',
      })
      .expect(200);

    professorToken = professorLoginResponse.body.access_token;
  });

  describe('POST /students', () => {
    it('should create a new student when authenticated as admin', () => {
      const createStudentDto = {
        nome: 'Test Student',
        serie: '1º Ano',
        dataNascimento: '2010-01-01',
        usuarioId: professorId,
      };

      return request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createStudentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nome).toBe(createStudentDto.nome);
          expect(res.body.serie).toBe(createStudentDto.serie);
          expect(res.body.dataNascimento).toBe(createStudentDto.dataNascimento);
          expect(res.body.usuarioId).toBe(createStudentDto.usuarioId);
        });
    });

    it('should not create student without authentication', () => {
      const createStudentDto = {
        nome: 'Test Student',
        serie: '1º Ano',
        dataNascimento: '2010-01-01',
        usuarioId: professorId,
      };

      return request(app.getHttpServer())
        .post('/students')
        .send(createStudentDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      const createStudentDto = {
        nome: '',
        serie: '',
        dataNascimento: '',
        usuarioId: '',
      };

      return request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createStudentDto)
        .expect(400);
    });
  });

  describe('GET /students', () => {
    beforeEach(async () => {
      // Criar alguns estudantes de teste
      const students = [
        {
          nome: 'Student 1',
          serie: '1º Ano',
          dataNascimento: '2010-01-01',
          usuarioId: professorId,
        },
        {
          nome: 'Student 2',
          serie: '2º Ano',
          dataNascimento: '2009-01-01',
          usuarioId: professorId,
        },
      ];

      for (const student of students) {
        await request(app.getHttpServer())
          .post('/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(student)
          .expect(201);
      }
    });

    it('should list all students when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('nome');
          expect(res.body[0]).toHaveProperty('serie');
          expect(res.body[0]).toHaveProperty('dataNascimento');
          expect(res.body[0]).toHaveProperty('usuarioId');
        });
    });

    it('should not list students without authentication', () => {
      return request(app.getHttpServer())
        .get('/students')
        .expect(401);
    });

    it('should filter students by serie', () => {
      return request(app.getHttpServer())
        .get('/students')
        .query({ serie: '1º Ano' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(student => student.serie === '1º Ano')).toBe(true);
        });
    });
  });

  describe('GET /students/:id', () => {
    let studentId: string;

    beforeEach(async () => {
      const createStudentDto = {
        nome: 'Test Student',
        serie: '1º Ano',
        dataNascimento: '2010-01-01',
        usuarioId: professorId,
      };

      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createStudentDto)
        .expect(201);

      studentId = response.body.id;
    });

    it('should get student by id when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', studentId);
          expect(res.body).toHaveProperty('nome', 'Test Student');
          expect(res.body).toHaveProperty('serie', '1º Ano');
          expect(res.body).toHaveProperty('dataNascimento', '2010-01-01');
          expect(res.body).toHaveProperty('usuarioId', professorId);
        });
    });

    it('should return 404 for non-existent student', () => {
      return request(app.getHttpServer())
        .get('/students/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get student without authentication', () => {
      return request(app.getHttpServer())
        .get(`/students/${studentId}`)
        .expect(401);
    });
  });

  describe('PATCH /students/:id', () => {
    let studentId: string;

    beforeEach(async () => {
      const createStudentDto = {
        nome: 'Test Student',
        serie: '1º Ano',
        dataNascimento: '2010-01-01',
        usuarioId: professorId,
      };

      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createStudentDto)
        .expect(201);

      studentId = response.body.id;
    });

    it('should update student when authenticated as admin', () => {
      const updateDto = {
        nome: 'Updated Name',
        serie: '2º Ano',
      };

      return request(app.getHttpServer())
        .patch(`/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', studentId);
          expect(res.body.nome).toBe(updateDto.nome);
          expect(res.body.serie).toBe(updateDto.serie);
        });
    });

    it('should not update student without authentication', () => {
      const updateDto = {
        nome: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch(`/students/${studentId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 for non-existent student', () => {
      const updateDto = {
        nome: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch('/students/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /students/:id', () => {
    let studentId: string;

    beforeEach(async () => {
      const createStudentDto = {
        nome: 'Test Student',
        serie: '1º Ano',
        dataNascimento: '2010-01-01',
        usuarioId: professorId,
      };

      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createStudentDto)
        .expect(201);

      studentId = response.body.id;
    });

    it('should delete student when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', studentId);
          expect(res.body).toHaveProperty('nome', 'Test Student');
          expect(res.body).toHaveProperty('serie', '1º Ano');
        });
    });

    it('should not delete student without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/students/${studentId}`)
        .expect(401);
    });

    it('should return 404 for non-existent student', () => {
      return request(app.getHttpServer())
        .delete('/students/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 