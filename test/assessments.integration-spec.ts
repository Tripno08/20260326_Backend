import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('AssessmentsController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;
  let professorToken: string;
  let professorId: string;
  let studentId: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.avaliacao.deleteMany();
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

    // Criar um estudante para os testes
    const createStudentDto = {
      nome: 'Test Student',
      serie: '1º Ano',
      dataNascimento: '2010-01-01',
      usuarioId: professorId,
    };

    const studentResponse = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createStudentDto)
      .expect(201);

    studentId = studentResponse.body.id;
  });

  describe('POST /assessments', () => {
    it('should create a new assessment when authenticated as admin', () => {
      const createAssessmentDto = {
        data: '2024-03-26',
        tipo: 'PROVA_BIMESTRAL',
        pontuacao: 8.5,
        observacoes: 'Observações da avaliação',
        metadados: {
          disciplina: 'Matemática',
          bimestre: 1,
        },
        estudanteId: studentId,
      };

      return request(app.getHttpServer())
        .post('/assessments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAssessmentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.tipo).toBe(createAssessmentDto.tipo);
          expect(res.body.pontuacao).toBe(createAssessmentDto.pontuacao);
          expect(res.body.estudanteId).toBe(createAssessmentDto.estudanteId);
          expect(res.body.metadados).toEqual(createAssessmentDto.metadados);
        });
    });

    it('should not create assessment without authentication', () => {
      const createAssessmentDto = {
        data: '2024-03-26',
        tipo: 'PROVA_BIMESTRAL',
        pontuacao: 8.5,
        estudanteId: studentId,
      };

      return request(app.getHttpServer())
        .post('/assessments')
        .send(createAssessmentDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      const createAssessmentDto = {
        data: '',
        tipo: '',
        pontuacao: null,
        estudanteId: '',
      };

      return request(app.getHttpServer())
        .post('/assessments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAssessmentDto)
        .expect(400);
    });
  });

  describe('GET /assessments', () => {
    beforeEach(async () => {
      // Criar algumas avaliações de teste
      const assessments = [
        {
          data: '2024-03-26',
          tipo: 'PROVA_BIMESTRAL',
          pontuacao: 8.5,
          observacoes: 'Avaliação 1',
          metadados: {
            disciplina: 'Matemática',
            bimestre: 1,
          },
          estudanteId: studentId,
        },
        {
          data: '2024-03-27',
          tipo: 'TRABALHO_PRATICO',
          pontuacao: 9.0,
          observacoes: 'Avaliação 2',
          metadados: {
            disciplina: 'Português',
            bimestre: 1,
          },
          estudanteId: studentId,
        },
      ];

      for (const assessment of assessments) {
        await request(app.getHttpServer())
          .post('/assessments')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(assessment)
          .expect(201);
      }
    });

    it('should list all assessments when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/assessments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('tipo');
          expect(res.body[0]).toHaveProperty('pontuacao');
          expect(res.body[0]).toHaveProperty('estudanteId');
          expect(res.body[0]).toHaveProperty('metadados');
        });
    });

    it('should not list assessments without authentication', () => {
      return request(app.getHttpServer())
        .get('/assessments')
        .expect(401);
    });

    it('should filter assessments by type', () => {
      return request(app.getHttpServer())
        .get('/assessments')
        .query({ tipo: 'PROVA_BIMESTRAL' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(assessment => assessment.tipo === 'PROVA_BIMESTRAL')).toBe(true);
        });
    });
  });

  describe('GET /assessments/:id', () => {
    let assessmentId: string;

    beforeEach(async () => {
      const createAssessmentDto = {
        data: '2024-03-26',
        tipo: 'PROVA_BIMESTRAL',
        pontuacao: 8.5,
        observacoes: 'Avaliação de teste',
        metadados: {
          disciplina: 'Matemática',
          bimestre: 1,
        },
        estudanteId: studentId,
      };

      const response = await request(app.getHttpServer())
        .post('/assessments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAssessmentDto)
        .expect(201);

      assessmentId = response.body.id;
    });

    it('should get assessment by id when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', assessmentId);
          expect(res.body).toHaveProperty('tipo', 'PROVA_BIMESTRAL');
          expect(res.body).toHaveProperty('pontuacao', 8.5);
          expect(res.body).toHaveProperty('estudanteId', studentId);
          expect(res.body.metadados).toEqual({
            disciplina: 'Matemática',
            bimestre: 1,
          });
        });
    });

    it('should return 404 for non-existent assessment', () => {
      return request(app.getHttpServer())
        .get('/assessments/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get assessment without authentication', () => {
      return request(app.getHttpServer())
        .get(`/assessments/${assessmentId}`)
        .expect(401);
    });
  });

  describe('PATCH /assessments/:id', () => {
    let assessmentId: string;

    beforeEach(async () => {
      const createAssessmentDto = {
        data: '2024-03-26',
        tipo: 'PROVA_BIMESTRAL',
        pontuacao: 8.5,
        observacoes: 'Avaliação de teste',
        metadados: {
          disciplina: 'Matemática',
          bimestre: 1,
        },
        estudanteId: studentId,
      };

      const response = await request(app.getHttpServer())
        .post('/assessments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAssessmentDto)
        .expect(201);

      assessmentId = response.body.id;
    });

    it('should update assessment when authenticated as admin', () => {
      const updateDto = {
        pontuacao: 9.0,
        observacoes: 'Avaliação atualizada',
        metadados: {
          disciplina: 'Matemática',
          bimestre: 1,
          observacoes: 'Atualizado',
        },
      };

      return request(app.getHttpServer())
        .patch(`/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', assessmentId);
          expect(res.body.pontuacao).toBe(updateDto.pontuacao);
          expect(res.body.observacoes).toBe(updateDto.observacoes);
          expect(res.body.metadados).toEqual(updateDto.metadados);
        });
    });

    it('should not update assessment without authentication', () => {
      const updateDto = {
        pontuacao: 9.0,
      };

      return request(app.getHttpServer())
        .patch(`/assessments/${assessmentId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 for non-existent assessment', () => {
      const updateDto = {
        pontuacao: 9.0,
      };

      return request(app.getHttpServer())
        .patch('/assessments/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /assessments/:id', () => {
    let assessmentId: string;

    beforeEach(async () => {
      const createAssessmentDto = {
        data: '2024-03-26',
        tipo: 'PROVA_BIMESTRAL',
        pontuacao: 8.5,
        observacoes: 'Avaliação de teste',
        metadados: {
          disciplina: 'Matemática',
          bimestre: 1,
        },
        estudanteId: studentId,
      };

      const response = await request(app.getHttpServer())
        .post('/assessments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAssessmentDto)
        .expect(201);

      assessmentId = response.body.id;
    });

    it('should delete assessment when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', assessmentId);
          expect(res.body).toHaveProperty('tipo', 'PROVA_BIMESTRAL');
          expect(res.body).toHaveProperty('pontuacao', 8.5);
          expect(res.body.metadados).toEqual({
            disciplina: 'Matemática',
            bimestre: 1,
          });
        });
    });

    it('should not delete assessment without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/assessments/${assessmentId}`)
        .expect(401);
    });

    it('should return 404 for non-existent assessment', () => {
      return request(app.getHttpServer())
        .delete('/assessments/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 