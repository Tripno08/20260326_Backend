import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { CargoUsuario, Status, NivelIntervencao, AreaIntervencao, FrequenciaAplicacao } from '@prisma/client';

describe('InterventionsController (e2e)', () => {
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
    await prisma.intervencao.deleteMany();
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

  describe('POST /interventions', () => {
    it('should create a new intervention when authenticated as admin', () => {
      const createInterventionDto = {
        dataInicio: '2024-03-26',
        tipo: 'ACADEMICA',
        descricao: 'Intervenção de teste',
        status: Status.ATIVO,
        observacoes: 'Observações da intervenção',
        estudanteId: studentId,
      };

      return request(app.getHttpServer())
        .post('/interventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createInterventionDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.tipo).toBe(createInterventionDto.tipo);
          expect(res.body.descricao).toBe(createInterventionDto.descricao);
          expect(res.body.status).toBe(createInterventionDto.status);
          expect(res.body.estudanteId).toBe(createInterventionDto.estudanteId);
        });
    });

    it('should not create intervention without authentication', () => {
      const createInterventionDto = {
        dataInicio: '2024-03-26',
        tipo: 'ACADEMICA',
        descricao: 'Intervenção de teste',
        status: Status.ATIVO,
        estudanteId: studentId,
      };

      return request(app.getHttpServer())
        .post('/interventions')
        .send(createInterventionDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      const createInterventionDto = {
        dataInicio: '',
        tipo: '',
        descricao: '',
        status: '',
        estudanteId: '',
      };

      return request(app.getHttpServer())
        .post('/interventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createInterventionDto)
        .expect(400);
    });
  });

  describe('GET /interventions', () => {
    beforeEach(async () => {
      // Criar algumas intervenções de teste
      const interventions = [
        {
          dataInicio: '2024-03-26',
          tipo: 'ACADEMICA',
          descricao: 'Intervenção 1',
          status: Status.ATIVO,
          estudanteId: studentId,
        },
        {
          dataInicio: '2024-03-27',
          tipo: 'COMPORTAMENTAL',
          descricao: 'Intervenção 2',
          status: Status.EM_ANDAMENTO,
          estudanteId: studentId,
        },
      ];

      for (const intervention of interventions) {
        await request(app.getHttpServer())
          .post('/interventions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(intervention)
          .expect(201);
      }
    });

    it('should list all interventions when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/interventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('tipo');
          expect(res.body[0]).toHaveProperty('descricao');
          expect(res.body[0]).toHaveProperty('status');
          expect(res.body[0]).toHaveProperty('estudanteId');
        });
    });

    it('should not list interventions without authentication', () => {
      return request(app.getHttpServer())
        .get('/interventions')
        .expect(401);
    });

    it('should filter interventions by status', () => {
      return request(app.getHttpServer())
        .get('/interventions')
        .query({ status: Status.ATIVO })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(intervention => intervention.status === Status.ATIVO)).toBe(true);
        });
    });
  });

  describe('GET /interventions/:id', () => {
    let interventionId: string;

    beforeEach(async () => {
      const createInterventionDto = {
        dataInicio: '2024-03-26',
        tipo: 'ACADEMICA',
        descricao: 'Intervenção de teste',
        status: Status.ATIVO,
        estudanteId: studentId,
      };

      const response = await request(app.getHttpServer())
        .post('/interventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createInterventionDto)
        .expect(201);

      interventionId = response.body.id;
    });

    it('should get intervention by id when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/interventions/${interventionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', interventionId);
          expect(res.body).toHaveProperty('tipo', 'ACADEMICA');
          expect(res.body).toHaveProperty('descricao', 'Intervenção de teste');
          expect(res.body).toHaveProperty('status', Status.ATIVO);
          expect(res.body).toHaveProperty('estudanteId', studentId);
        });
    });

    it('should return 404 for non-existent intervention', () => {
      return request(app.getHttpServer())
        .get('/interventions/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get intervention without authentication', () => {
      return request(app.getHttpServer())
        .get(`/interventions/${interventionId}`)
        .expect(401);
    });
  });

  describe('PATCH /interventions/:id', () => {
    let interventionId: string;

    beforeEach(async () => {
      const createInterventionDto = {
        dataInicio: '2024-03-26',
        tipo: 'ACADEMICA',
        descricao: 'Intervenção de teste',
        status: Status.ATIVO,
        estudanteId: studentId,
      };

      const response = await request(app.getHttpServer())
        .post('/interventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createInterventionDto)
        .expect(201);

      interventionId = response.body.id;
    });

    it('should update intervention when authenticated as admin', () => {
      const updateDto = {
        descricao: 'Intervenção atualizada',
        status: Status.EM_ANDAMENTO,
      };

      return request(app.getHttpServer())
        .patch(`/interventions/${interventionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', interventionId);
          expect(res.body.descricao).toBe(updateDto.descricao);
          expect(res.body.status).toBe(updateDto.status);
        });
    });

    it('should not update intervention without authentication', () => {
      const updateDto = {
        descricao: 'Intervenção atualizada',
      };

      return request(app.getHttpServer())
        .patch(`/interventions/${interventionId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 for non-existent intervention', () => {
      const updateDto = {
        descricao: 'Intervenção atualizada',
      };

      return request(app.getHttpServer())
        .patch('/interventions/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /interventions/:id', () => {
    let interventionId: string;

    beforeEach(async () => {
      const createInterventionDto = {
        dataInicio: '2024-03-26',
        tipo: 'ACADEMICA',
        descricao: 'Intervenção de teste',
        status: Status.ATIVO,
        estudanteId: studentId,
      };

      const response = await request(app.getHttpServer())
        .post('/interventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createInterventionDto)
        .expect(201);

      interventionId = response.body.id;
    });

    it('should delete intervention when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/interventions/${interventionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', interventionId);
          expect(res.body).toHaveProperty('tipo', 'ACADEMICA');
          expect(res.body).toHaveProperty('descricao', 'Intervenção de teste');
        });
    });

    it('should not delete intervention without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/interventions/${interventionId}`)
        .expect(401);
    });

    it('should return 404 for non-existent intervention', () => {
      return request(app.getHttpServer())
        .delete('/interventions/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 