import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuditService } from '../src/modules/audit/audit.service';
import { PrismaService } from '../src/shared/prisma/prisma.service';

describe('Sistema de Auditoria', () => {
  let app: INestApplication;
  let auditService: AuditService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    auditService = moduleFixture.get<AuditService>(AuditService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeAll(async () => {
    // Limpar dados de teste
    await prisma.customAuditoria.deleteMany();
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.customAuditoria.deleteMany();
    await prisma.usuario.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.auditoria.deleteMany();
    await prisma.usuario.deleteMany();
  });

  it('deve registrar ação de auditoria', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Test User',
      },
    });

    await auditService.registrarAcao(
      usuario.id,
      'CRIAR',
      'ESTUDANTE',
      '123',
      'Detalhes do teste',
    );

    const auditorias = await prisma.auditoria.findMany({
      where: { usuarioId: usuario.id },
    });

    expect(auditorias).toHaveLength(1);
    expect(auditorias[0].acao).toBe('CRIAR');
    expect(auditorias[0].entidade).toBe('ESTUDANTE');
    expect(auditorias[0].entidadeId).toBe('123');
    expect(auditorias[0].detalhes).toBe('Detalhes do teste');
  });

  it('deve buscar auditorias por usuário', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Test User',
      },
    });

    await auditService.registrarAcao(usuario.id, 'CRIAR', 'ESTUDANTE', '123');
    await auditService.registrarAcao(usuario.id, 'ATUALIZAR', 'ESTUDANTE', '123');

    const filtros = {
      usuarioId: usuario.id,
    };
    const auditorias = await auditService.buscarAcoes(filtros);
    expect(auditorias.dados).toHaveLength(2);
    expect(auditorias.dados[0].usuario.id).toBe(usuario.id);
  });

  it('deve buscar auditorias por entidade', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Test User',
      },
    });

    await auditService.registrarAcao(usuario.id, 'CRIAR', 'ESTUDANTE', '123');
    await auditService.registrarAcao(usuario.id, 'CRIAR', 'AVALIACAO', '456');

    const filtros = {
      entidade: 'ESTUDANTE',
    };
    const auditorias = await auditService.buscarAcoes(filtros);
    expect(auditorias.dados).toHaveLength(1);
    expect(auditorias.dados[0].entidade).toBe('ESTUDANTE');
  });

  it('deve buscar auditorias por período', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Test User',
      },
    });

    const dataInicio = new Date();
    await auditService.registrarAcao(usuario.id, 'CRIAR', 'ESTUDANTE', '123');
    const dataFim = new Date();

    const filtros = {
      dataInicio,
      dataFim,
    };
    const auditorias = await auditService.buscarAcoes(filtros);
    expect(auditorias.dados).toHaveLength(1);
    expect(auditorias.dados[0].criadoEm).toBeDefined();
  });

  it('should list audit records with pagination', async () => {
    // Verificar se os registros foram salvos
    const auditorias = await prisma.customAuditoria.findMany({
      orderBy: {
        criado_em: 'desc',
      },
    });
  });
}); 