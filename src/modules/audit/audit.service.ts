import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async registrarAcao(
    usuarioId: string,
    acao: string,
    entidade: string,
    entidadeId: string,
    detalhes?: any,
  ) {
    return this.prisma.customAuditoria.create({
      data: {
        usuarioId,
        acao,
        entidade,
        entidadeId,
        detalhes,
      }
    });
  }

  async buscarAcoes(
    filtros?: {
      usuarioId?: string;
      entidade?: string;
      entidadeId?: string;
      acao?: string;
      dataInicio?: Date;
      dataFim?: Date;
    },
    pagina = 1,
    itensPorPagina = 25,
  ) {
    const where: any = {};

    if (filtros) {
      if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
      if (filtros.entidade) where.entidade = filtros.entidade;
      if (filtros.entidadeId) where.entidadeId = filtros.entidadeId;
      if (filtros.acao) where.acao = filtros.acao;

      if (filtros.dataInicio || filtros.dataFim) {
        where.criadoEm = {};
        if (filtros.dataInicio) where.criadoEm.gte = filtros.dataInicio;
        if (filtros.dataFim) where.criadoEm.lte = filtros.dataFim;
      }
    }

    const [registros, total] = await Promise.all([
      this.prisma.customAuditoria.findMany({
        where: filtros,
        skip: (pagina - 1) * itensPorPagina,
        take: itensPorPagina,
        orderBy: { criado_em: 'desc' },
      }),
      this.prisma.customAuditoria.count({ where: filtros }),
    ]);

    return {
      dados: registros,
      meta: {
        total,
        pagina,
        itensPorPagina,
        totalPaginas: Math.ceil(total / itensPorPagina),
      },
    };
  }
} 