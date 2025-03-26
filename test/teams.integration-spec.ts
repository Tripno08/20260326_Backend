import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { CargoUsuario, CargoEquipe } from '@prisma/client';

describe('TeamsController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;
  let professorToken: string;
  let professorId: string;
  let especialistaToken: string;
  let especialistaId: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.membroEquipe.deleteMany();
    await prisma.equipe.deleteMany();
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

    // Criar um usuário especialista para os testes
    const especialistaDto = {
      email: 'especialista@example.com',
      senha: 'Test@123',
      nome: 'Especialista Test',
      cargo: CargoUsuario.ESPECIALISTA,
    };

    const especialistaResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(especialistaDto)
      .expect(201);

    especialistaId = especialistaResponse.body.id;

    const especialistaLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'especialista@example.com',
        senha: 'Test@123',
      })
      .expect(200);

    especialistaToken = especialistaLoginResponse.body.access_token;
  });

  describe('POST /teams', () => {
    it('should create a new team when authenticated as admin', () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nome).toBe(createTeamDto.nome);
          expect(res.body.descricao).toBe(createTeamDto.descricao);
          expect(res.body.ativo).toBe(createTeamDto.ativo);
        });
    });

    it('should not create team without authentication', () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      return request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      const createTeamDto = {
        nome: '',
        descricao: '',
        ativo: null,
      };

      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(400);
    });
  });

  describe('GET /teams', () => {
    beforeEach(async () => {
      // Criar algumas equipes de teste
      const teams = [
        {
          nome: 'Equipe de Apoio 1',
          descricao: 'Primeira equipe de apoio',
          ativo: true,
        },
        {
          nome: 'Equipe de Apoio 2',
          descricao: 'Segunda equipe de apoio',
          ativo: true,
        },
      ];

      for (const team of teams) {
        await request(app.getHttpServer())
          .post('/teams')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(team)
          .expect(201);
      }
    });

    it('should list all teams when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('nome');
          expect(res.body[0]).toHaveProperty('descricao');
          expect(res.body[0]).toHaveProperty('ativo');
        });
    });

    it('should not list teams without authentication', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .expect(401);
    });

    it('should filter teams by active status', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .query({ ativo: true })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(team => team.ativo === true)).toBe(true);
        });
    });
  });

  describe('GET /teams/:id', () => {
    let teamId: string;

    beforeEach(async () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201);

      teamId = response.body.id;
    });

    it('should get team by id when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', teamId);
          expect(res.body).toHaveProperty('nome', 'Equipe de Apoio');
          expect(res.body).toHaveProperty('descricao', 'Equipe multidisciplinar de apoio aos estudantes');
          expect(res.body).toHaveProperty('ativo', true);
        });
    });

    it('should return 404 for non-existent team', () => {
      return request(app.getHttpServer())
        .get('/teams/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get team without authentication', () => {
      return request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .expect(401);
    });
  });

  describe('PATCH /teams/:id', () => {
    let teamId: string;

    beforeEach(async () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201);

      teamId = response.body.id;
    });

    it('should update team when authenticated as admin', () => {
      const updateDto = {
        nome: 'Equipe de Apoio Atualizada',
        descricao: 'Nova descrição da equipe',
        ativo: true,
      };

      return request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', teamId);
          expect(res.body.nome).toBe(updateDto.nome);
          expect(res.body.descricao).toBe(updateDto.descricao);
          expect(res.body.ativo).toBe(updateDto.ativo);
        });
    });

    it('should not update team without authentication', () => {
      const updateDto = {
        nome: 'Equipe de Apoio Atualizada',
      };

      return request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 for non-existent team', () => {
      const updateDto = {
        nome: 'Equipe de Apoio Atualizada',
      };

      return request(app.getHttpServer())
        .patch('/teams/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /teams/:id', () => {
    let teamId: string;

    beforeEach(async () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201);

      teamId = response.body.id;
    });

    it('should delete team when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', teamId);
          expect(res.body).toHaveProperty('nome', 'Equipe de Apoio');
          expect(res.body).toHaveProperty('descricao', 'Equipe multidisciplinar de apoio aos estudantes');
          expect(res.body).toHaveProperty('ativo', true);
        });
    });

    it('should not delete team without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${teamId}`)
        .expect(401);
    });

    it('should return 404 for non-existent team', () => {
      return request(app.getHttpServer())
        .delete('/teams/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /teams/:id/members', () => {
    let teamId: string;

    beforeEach(async () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201);

      teamId = response.body.id;
    });

    it('should add member to team when authenticated as admin', () => {
      const addMemberDto = {
        usuarioId: professorId,
        cargo: CargoEquipe.PROFESSOR,
        ativo: true,
      };

      return request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(addMemberDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.usuarioId).toBe(addMemberDto.usuarioId);
          expect(res.body.equipeId).toBe(teamId);
          expect(res.body.cargo).toBe(addMemberDto.cargo);
          expect(res.body.ativo).toBe(addMemberDto.ativo);
        });
    });

    it('should not add member without authentication', () => {
      const addMemberDto = {
        usuarioId: professorId,
        cargo: CargoEquipe.PROFESSOR,
        ativo: true,
      };

      return request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .send(addMemberDto)
        .expect(401);
    });

    it('should validate required fields when adding member', () => {
      const addMemberDto = {
        usuarioId: '',
        cargo: '',
        ativo: null,
      };

      return request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(addMemberDto)
        .expect(400);
    });
  });

  describe('GET /teams/:id/members', () => {
    let teamId: string;

    beforeEach(async () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201);

      teamId = response.body.id;

      // Adicionar membros à equipe
      const members = [
        {
          usuarioId: professorId,
          cargo: CargoEquipe.PROFESSOR,
          ativo: true,
        },
        {
          usuarioId: especialistaId,
          cargo: CargoEquipe.ESPECIALISTA,
          ativo: true,
        },
      ];

      for (const member of members) {
        await request(app.getHttpServer())
          .post(`/teams/${teamId}/members`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(member)
          .expect(201);
      }
    });

    it('should list team members when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/teams/${teamId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('usuarioId');
          expect(res.body[0]).toHaveProperty('cargo');
          expect(res.body[0]).toHaveProperty('ativo');
        });
    });

    it('should not list team members without authentication', () => {
      return request(app.getHttpServer())
        .get(`/teams/${teamId}/members`)
        .expect(401);
    });

    it('should filter team members by role', () => {
      return request(app.getHttpServer())
        .get(`/teams/${teamId}/members`)
        .query({ cargo: CargoEquipe.PROFESSOR })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(member => member.cargo === CargoEquipe.PROFESSOR)).toBe(true);
        });
    });
  });

  describe('DELETE /teams/:id/members/:memberId', () => {
    let teamId: string;
    let memberId: string;

    beforeEach(async () => {
      const createTeamDto = {
        nome: 'Equipe de Apoio',
        descricao: 'Equipe multidisciplinar de apoio aos estudantes',
        ativo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTeamDto)
        .expect(201);

      teamId = response.body.id;

      // Adicionar membro à equipe
      const addMemberDto = {
        usuarioId: professorId,
        cargo: CargoEquipe.PROFESSOR,
        ativo: true,
      };

      const memberResponse = await request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(addMemberDto)
        .expect(201);

      memberId = memberResponse.body.id;
    });

    it('should remove member from team when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/${memberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', memberId);
          expect(res.body.usuarioId).toBe(professorId);
          expect(res.body.equipeId).toBe(teamId);
          expect(res.body.cargo).toBe(CargoEquipe.PROFESSOR);
          expect(res.body.ativo).toBe(true);
        });
    });

    it('should not remove member without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/${memberId}`)
        .expect(401);
    });

    it('should return 404 for non-existent member', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/non-existent-id`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 