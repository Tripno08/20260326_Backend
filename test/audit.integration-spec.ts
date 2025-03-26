import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuditService } from '../src/shared/audit/audit.service';
import { PrismaService } from '../src/shared/prisma/prisma.service';

describe('Sistema de Auditoria', () => {
  let app: INestApplication;
  let auditService: AuditService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    auditService = moduleFixture.get<AuditService>(AuditService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.auditoria.deleteMany();
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

    await auditService.registrar(
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

    await auditService.registrar(usuario.id, 'CRIAR', 'ESTUDANTE');
    await auditService.registrar(usuario.id, 'ATUALIZAR', 'ESTUDANTE');

    const auditorias = await auditService.buscarPorUsuario(usuario.id);
    expect(auditorias).toHaveLength(2);
    expect(auditorias[0].usuarioId).toBe(usuario.id);
  });

  it('deve buscar auditorias por entidade', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Test User',
      },
    });

    await auditService.registrar(usuario.id, 'CRIAR', 'ESTUDANTE', '123');
    await auditService.registrar(usuario.id, 'CRIAR', 'AVALIACAO', '456');

    const auditorias = await auditService.buscarPorEntidade('ESTUDANTE');
    expect(auditorias).toHaveLength(1);
    expect(auditorias[0].entidade).toBe('ESTUDANTE');
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
    await auditService.registrar(usuario.id, 'CRIAR', 'ESTUDANTE');
    const dataFim = new Date();

    const auditorias = await auditService.buscarPorPeriodo(dataInicio, dataFim);
    expect(auditorias).toHaveLength(1);
    expect(auditorias[0].criadoEm).toBeDefined();
  });

  it('deve exportar logs de auditoria', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Test User',
      },
    });

    await auditService.registrar(usuario.id, 'CRIAR', 'ESTUDANTE', '123', 'Detalhes');

    const dataInicio = new Date(Date.now() - 3600000); // 1 hora atrás
    const dataFim = new Date();
    const logs = await auditService.exportarLogs(dataInicio, dataFim);

    expect(logs).toHaveLength(1);
    expect(logs[0].usuario).toBe(usuario.nome);
    expect(logs[0].email).toBe(usuario.email);
    expect(logs[0].acao).toBe('CRIAR');
    expect(logs[0].entidade).toBe('ESTUDANTE');
    expect(logs[0].entidadeId).toBe('123');
    expect(logs[0].detalhes).toBe('Detalhes');
  });
}); 