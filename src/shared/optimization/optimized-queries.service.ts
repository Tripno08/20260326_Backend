import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOptimizerService } from './query-optimizer.service';
import { Estudante, Intervencao, Avaliacao, HistoricoDados } from '@prisma/client';

@Injectable()
export class OptimizedQueriesService {
  constructor(
    private prisma: PrismaService,
    private queryOptimizer: QueryOptimizerService,
  ) {}

  async getEstudanteComDadosCompletos(estudanteId: string) {
    const [estudante, intervencoes, avaliacoes, historico] = await Promise.all([
      this.queryOptimizer.loadEstudante(estudanteId),
      this.queryOptimizer.loadIntervencoes(estudanteId),
      this.queryOptimizer.loadAvaliacoes(estudanteId),
      this.prisma.historicoDados.findMany({
        where: { estudanteId },
        orderBy: { data: 'desc' },
        take: 10,
      }),
    ]);

    return {
      estudante,
      intervencoes,
      avaliacoes,
      historico,
    };
  }

  async getEstudantesPorSerie(serie: string) {
    return this.prisma.estudante.findMany({
      where: { serie },
      include: {
        Instituicao: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async getIntervencoesAtivas(estudanteId: string) {
    return this.prisma.intervencao.findMany({
      where: {
        estudanteId,
        status: 'ATIVO',
        dataFim: null,
      },
      include: {
        intervencaoBase: true,
        metas: true,
      },
      orderBy: { dataInicio: 'desc' },
    });
  }

  async getAvaliacoesPorPeriodo(estudanteId: string, dataInicio: Date, dataFim: Date) {
    return this.prisma.avaliacao.findMany({
      where: {
        estudanteId,
        data: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  async getHistoricoDadosPorTipo(estudanteId: string, tipoMedicao: string) {
    return this.prisma.historicoDados.findMany({
      where: {
        estudanteId,
        tipoMedicao,
      },
      orderBy: { data: 'desc' },
    });
  }

  async getEstudantesComRisco() {
    return this.prisma.estudante.findMany({
      where: {
        OR: [
          {
            PrevisaoEstudante: {
              some: {
                probabilidade: {
                  gt: 0.7,
                },
              },
            },
          },
          {
            dificuldades: {
              some: {
                nivel: 'ALTO',
              },
            },
          },
        ],
      },
      include: {
        PrevisaoEstudante: {
          orderBy: { dataAnalise: 'desc' },
          take: 1,
        },
        dificuldades: {
          where: {
            nivel: 'ALTO',
          },
        },
      },
    });
  }

  async getEncaminhamentosPendentes(usuarioId: string) {
    return this.prisma.encaminhamento.findMany({
      where: {
        atribuidoPara: usuarioId,
        status: 'PENDENTE',
        dataPrazo: {
          gte: new Date(),
        },
      },
      include: {
        estudante: true,
        criadoUsuario: true,
      },
      orderBy: [
        { prioridade: 'desc' },
        { dataPrazo: 'asc' },
      ],
    });
  }

  async getMensagensNaoLidas(usuarioId: string) {
    return this.prisma.mensagem.findMany({
      where: {
        destinatarioId: usuarioId,
        lida: false,
      },
      include: {
        remetente: true,
        estudante: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async getNotificacoesNaoLidas(usuarioId: string) {
    return this.prisma.notificacao.findMany({
      where: {
        usuarioId,
        lida: false,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }
} 