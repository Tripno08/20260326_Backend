import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('SecurityController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;
  let professorToken: string;
  let professorId: string;
  let estudanteId: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
    // Limpar dados de teste
    await prisma.customAuditoria.deleteMany();
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.previsaoEstudante.deleteMany();
    await prisma.historicoDados.deleteMany();
    await prisma.estudante.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();
    await prisma.auditoria.deleteMany();

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
    const estudanteDto = {
      nome: 'Estudante Test',
      serie: '1º Ano',
      dataNascimento: '2010-01-01',
      usuarioId: professorId,
    };

    const estudanteResponse = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(estudanteDto)
      .expect(201);

    estudanteId = estudanteResponse.body.id;
  });

  describe('Multi-Factor Authentication Tests', () => {
    it('should require 2FA for admin users', async () => {
      // Tentar acessar endpoint protegido sem 2FA
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.error.message).toContain('2FA required');

      // Configurar 2FA
      const setupResponse = await request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(setupResponse.body).toHaveProperty('secret');
      expect(setupResponse.body).toHaveProperty('qrCode');

      // Verificar código 2FA
      const verifyResponse = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: '123456', // Código de teste
        })
        .expect(200);

      expect(verifyResponse.body).toHaveProperty('verified', true);

      // Tentar acessar endpoint protegido com 2FA
      const protectedResponse = await request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-2FA-Code', '123456')
        .expect(200);

      expect(protectedResponse.body).toBeDefined();
    });

    it('should not require 2FA for non-admin users', async () => {
      const response = await request(app.getHttpServer())
        .get('/professor/dashboard')
        .set('Authorization', `Bearer ${professorToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Audit Log Tests', () => {
    it('should log all sensitive operations', async () => {
      // Realizar operações sensíveis
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Novo Estudante',
          serie: '2º Ano',
          dataNascimento: '2010-01-01',
          usuarioId: professorId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .put(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Estudante Atualizado',
        })
        .expect(200);

      // Verificar logs de auditoria
      const auditLogs = await request(app.getHttpServer())
        .get('/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(auditLogs.body).toHaveLength(2);
      expect(auditLogs.body[0]).toHaveProperty('acao', 'CREATE');
      expect(auditLogs.body[0]).toHaveProperty('recurso', 'STUDENT');
      expect(auditLogs.body[1]).toHaveProperty('acao', 'UPDATE');
      expect(auditLogs.body[1]).toHaveProperty('recurso', 'STUDENT');
    });

    it('should include user and IP information in audit logs', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Forwarded-For', '192.168.1.1')
        .send({
          nome: 'Novo Estudante',
          serie: '2º Ano',
          dataNascimento: '2010-01-01',
          usuarioId: professorId,
        })
        .expect(201);

      const auditLogs = await request(app.getHttpServer())
        .get('/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(auditLogs.body[0]).toHaveProperty('usuarioId');
      expect(auditLogs.body[0]).toHaveProperty('ipAddress', '192.168.1.1');
    });

    it('should allow filtering audit logs', async () => {
      // Realizar diferentes tipos de operações
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Novo Estudante',
          serie: '2º Ano',
          dataNascimento: '2010-01-01',
          usuarioId: professorId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Filtrar por ação
      const createLogs = await request(app.getHttpServer())
        .get('/audit/logs')
        .query({ acao: 'CREATE' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(createLogs.body).toHaveLength(1);
      expect(createLogs.body[0].acao).toBe('CREATE');

      // Filtrar por recurso
      const studentLogs = await request(app.getHttpServer())
        .get('/audit/logs')
        .query({ recurso: 'STUDENT' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(studentLogs.body.length).toBeGreaterThan(0);
      expect(studentLogs.body.every(log => log.recurso === 'STUDENT')).toBe(true);
    });
  });

  describe('Security Headers Tests', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
      expect(response.headers).toHaveProperty('content-security-policy');
    });

    it('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: xssPayload,
          serie: '2º Ano',
          dataNascimento: '2010-01-01',
          usuarioId: professorId,
        })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid input');
    });
  });

  describe('Session Management Tests', () => {
    it('should invalidate all sessions on password change', async () => {
      // Criar múltiplas sessões
      const session1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          senha: 'Admin@123',
        })
        .expect(200);

      const session2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          senha: 'Admin@123',
        })
        .expect(200);

      // Alterar senha
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          senhaAtual: 'Admin@123',
          novaSenha: 'NewAdmin@123',
        })
        .expect(200);

      // Tentar usar tokens antigos
      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${session1.body.access_token}`)
        .expect(401);

      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${session2.body.access_token}`)
        .expect(401);
    });

    it('should allow session revocation', async () => {
      // Criar uma nova sessão
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          senha: 'Admin@123',
        })
        .expect(200);

      const newToken = loginResponse.body.access_token;

      // Revogar sessão
      await request(app.getHttpServer())
        .post('/auth/revoke-session')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      // Tentar usar token revogado
      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(401);
    });
  });
}); 