import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { QueryOptimizerService } from '../src/shared/optimization/query-optimizer.service';
import { OptimizedQueriesService } from '../src/shared/optimization/optimized-queries.service';
import { CargoUsuario } from '@prisma/client';

describe('Query Optimization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let optimizerService: QueryOptimizerService;
  let optimizedQueries: OptimizedQueriesService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    optimizerService = moduleFixture.get<QueryOptimizerService>(QueryOptimizerService);
    optimizedQueries = moduleFixture.get<OptimizedQueriesService>(OptimizedQueriesService);
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.estudante.deleteMany(),
      prisma.usuario.deleteMany(),
      prisma.intervencao.deleteMany(),
      prisma.avaliacao.deleteMany(),
      prisma.historicoDados.deleteMany(),
    ]);
  });

  describe('DataLoader', () => {
    it('deve carregar estudantes em lote', async () => {
      const admin = await prisma.usuario.create({
        data: {
          email: 'admin@test.com',
          senha: 'senha123',
          nome: 'Admin Test',
          cargo: CargoUsuario.ADMIN,
        },
      });

      const estudantes = await Promise.all([
        prisma.estudante.create({
          data: {
            nome: 'Estudante 1',
            serie: '1º Ano',
            dataNascimento: new Date('2010-01-01'),
            usuarioId: admin.id,
          },
        }),
        prisma.estudante.create({
          data: {
            nome: 'Estudante 2',
            serie: '2º Ano',
            dataNascimento: new Date('2011-01-01'),
            usuarioId: admin.id,
          },
        }),
      ]);

      const result = await optimizerService.loadEstudantes(estudantes.map(e => e.id));
      expect(result).toHaveLength(2);
      expect(result[0]).not.toBeInstanceOf(Error);
      if (!(result[0] instanceof Error)) {
        expect(result[0].id).toBe(estudantes[0].id);
      }
    });

    it('deve carregar intervenções por estudante', async () => {
      const admin = await prisma.usuario.create({
        data: {
          email: 'admin@test.com',
          senha: 'senha123',
          nome: 'Admin Test',
          cargo: CargoUsuario.ADMIN,
        },
      });

      const estudante = await prisma.estudante.create({
        data: {
          nome: 'Estudante Test',
          serie: '1º Ano',
          dataNascimento: new Date('2010-01-01'),
          usuarioId: admin.id,
        },
      });

      const intervencoes = await Promise.all([
        prisma.intervencao.create({
          data: {
            dataInicio: new Date(),
            tipo: 'Tipo 1',
            descricao: 'Descrição 1',
            status: 'ATIVO',
            estudanteId: estudante.id,
          },
        }),
        prisma.intervencao.create({
          data: {
            dataInicio: new Date(),
            tipo: 'Tipo 2',
            descricao: 'Descrição 2',
            status: 'ATIVO',
            estudanteId: estudante.id,
          },
        }),
      ]);

      const result = await optimizerService.loadIntervencoes(estudante.id);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(intervencoes[0].id);
      expect(result[1].id).toBe(intervencoes[1].id);
    });
  });

  describe('Consultas Otimizadas', () => {
    it('deve retornar estudante com dados completos', async () => {
      const admin = await prisma.usuario.create({
        data: {
          email: 'admin@test.com',
          senha: 'senha123',
          nome: 'Admin Test',
          cargo: CargoUsuario.ADMIN,
        },
      });

      const estudante = await prisma.estudante.create({
        data: {
          nome: 'Estudante Test',
          serie: '1º Ano',
          dataNascimento: new Date('2010-01-01'),
          usuarioId: admin.id,
        },
      });

      await Promise.all([
        prisma.intervencao.create({
          data: {
            dataInicio: new Date(),
            tipo: 'Tipo 1',
            descricao: 'Descrição 1',
            status: 'ATIVO',
            estudanteId: estudante.id,
          },
        }),
        prisma.avaliacao.create({
          data: {
            data: new Date(),
            tipo: 'Tipo 1',
            pontuacao: 8.5,
            estudanteId: estudante.id,
          },
        }),
        prisma.historicoDados.create({
          data: {
            tipoMedicao: 'Medição 1',
            valorNumerico: 10,
            data: new Date(),
            fonte: 'Fonte 1',
            estudanteId: estudante.id,
          },
        }),
      ]);

      const result = await optimizedQueries.getEstudanteComDadosCompletos(estudante.id);
      expect(result.estudante.id).toBe(estudante.id);
      expect(result.intervencoes).toHaveLength(1);
      expect(result.avaliacoes).toHaveLength(1);
      expect(result.historico).toHaveLength(1);
    });

    it('deve retornar estudantes com risco', async () => {
      const admin = await prisma.usuario.create({
        data: {
          email: 'admin@test.com',
          senha: 'senha123',
          nome: 'Admin Test',
          cargo: CargoUsuario.ADMIN,
        },
      });

      const estudante = await prisma.estudante.create({
        data: {
          nome: 'Estudante Test',
          serie: '1º Ano',
          dataNascimento: new Date('2010-01-01'),
          usuarioId: admin.id,
        },
      });

      await Promise.all([
        prisma.previsaoEstudante.create({
          data: {
            tipoPrevisao: 'Risco',
            probabilidade: 0.8,
            estudanteId: estudante.id,
          },
        }),
        prisma.estudanteDificuldade.create({
          data: {
            nivel: 'ALTO',
            estudanteId: estudante.id,
            dificuldadeId: 'dificuldade-id', // Você precisará criar uma dificuldade primeiro
          },
        }),
      ]);

      const result = await optimizedQueries.getEstudantesComRisco();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(estudante.id);
    });

    it('deve retornar encaminhamentos pendentes', async () => {
      const admin = await prisma.usuario.create({
        data: {
          email: 'admin@test.com',
          senha: 'senha123',
          nome: 'Admin Test',
          cargo: CargoUsuario.ADMIN,
        },
      });

      const estudante = await prisma.estudante.create({
        data: {
          nome: 'Estudante Test',
          serie: '1º Ano',
          dataNascimento: new Date('2010-01-01'),
          usuarioId: admin.id,
        },
      });

      await prisma.encaminhamento.create({
        data: {
          titulo: 'Encaminhamento Test',
          descricao: 'Descrição',
          status: 'PENDENTE',
          dataPrazo: new Date(Date.now() + 86400000), // Amanhã
          prioridade: 'ALTA',
          estudanteId: estudante.id,
          atribuidoPara: admin.id,
          criadoPor: admin.id,
        },
      });

      const result = await optimizedQueries.getEncaminhamentosPendentes(admin.id);
      expect(result).toHaveLength(1);
      expect(result[0].estudanteId).toBe(estudante.id);
    });
  });
}); 