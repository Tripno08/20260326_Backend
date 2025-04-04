import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateInsightDto, TipoInsight, NivelRisco } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { FindInsightQueryDto } from './dto/find-insight-query.dto';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInsightDto: CreateInsightDto) {
    // Validar os dados
    if (!createInsightDto.metricas || createInsightDto.metricas.length === 0) {
      throw new BadRequestException('Deve haver pelo menos uma métrica');
    }
    
    return this.prisma.customInsight.create({
      data: {
        ...createInsightDto,
      },
    });
  }

  async findAll(query: FindInsightQueryDto) {
    const { tipo, nivelRisco, de, ate } = query;
    
    const where: any = {};
    
    if (tipo) {
      where.tipo = tipo;
    }
    
    if (nivelRisco) {
      where.nivelRisco = nivelRisco;
    }
    
    if (de || ate) {
      where.createdAt = {};
      
      if (de) {
        where.createdAt.gte = new Date(de);
      }
      
      if (ate) {
        where.createdAt.lte = new Date(ate);
      }
    }

    const insights = await this.prisma.customInsight.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return insights;
  }

  async findOne(id: string) {
    const insight = await this.prisma.customInsight.findUnique({
      where: { id },
    });
    
    if (!insight) {
      throw new NotFoundException(`Insight com ID ${id} não encontrado`);
    }
    
    return insight;
  }

  async update(id: string, updateInsightDto: UpdateInsightDto) {
    return this.prisma.customInsight.update({
      where: { id },
      data: {
        ...updateInsightDto,
      },
    });
  }

  async remove(id: string) {
    // Verificar se o insight existe
    await this.findOne(id);
    
    await this.prisma.customInsight.delete({
      where: { id },
    });
  }

  // Função auxiliar para formatar os campos JSON
  private formatInsight(insight: any) {
    return {
      ...insight,
      metricas: typeof insight.metricas === 'string' ? JSON.parse(insight.metricas) : insight.metricas,
      recomendacoes: typeof insight.recomendacoes === 'string' ? JSON.parse(insight.recomendacoes) : insight.recomendacoes,
    };
  }

  async gerarInsightPredativo(estudanteId: string) {
    // Buscar dados históricos do estudante
    const historico = await this.prisma.historicoDados.findMany({
      where: { estudanteId },
      orderBy: { data: 'desc' },
    });

    // Buscar avaliações do estudante
    const avaliacoes = await this.prisma.avaliacao.findMany({
      where: { estudanteId },
      orderBy: { data: 'desc' },
    });

    // Buscar intervenções do estudante
    const intervencoes = await this.prisma.intervencao.findMany({
      where: { estudanteId },
      orderBy: { dataInicio: 'desc' },
    });

    // Analisar dados e gerar insights
    const insights = await this.analisarDadosEstudante(historico, avaliacoes, intervencoes);

    // Criar insights no banco de dados
    const insightsCriados = await Promise.all(
      insights.map(insight => this.create(insight))
    );

    return insightsCriados;
  }

  private async analisarDadosEstudante(
    historico: any[],
    avaliacoes: any[],
    intervencoes: any[]
  ): Promise<CreateInsightDto[]> {
    const insights: CreateInsightDto[] = [];

    // Análise de desempenho acadêmico
    if (avaliacoes.length > 0) {
      const mediaAvaliacoes = avaliacoes.reduce((acc, curr) => acc + curr.pontuacao, 0) / avaliacoes.length;
      const tendencia = this.calcularTendencia(avaliacoes.map(a => a.pontuacao));

      insights.push({
        titulo: 'Análise de Desempenho Acadêmico',
        descricao: `Média de avaliações: ${mediaAvaliacoes.toFixed(2)}. Tendência: ${tendencia}`,
        tipo: TipoInsight.DESCRITIVO,
        nivelRisco: this.determinarNivelRisco(mediaAvaliacoes, tendencia),
        metricas: [
          {
            nome: 'Média de Avaliações',
            valor: mediaAvaliacoes.toFixed(2),
            unidade: 'pontos'
          },
          {
            nome: 'Tendência',
            valor: tendencia,
            unidade: 'direção'
          }
        ],
        recomendacoes: this.gerarRecomendacoesDesempenho(mediaAvaliacoes, tendencia)
      });
    }

    // Análise de progresso em intervenções
    if (intervencoes.length > 0) {
      const intervencoesAtivas = intervencoes.filter(i => i.status === 'ATIVO');
      const progresso = await this.analisarProgressoIntervencoes(intervencoesAtivas);

      insights.push({
        titulo: 'Análise de Progresso em Intervenções',
        descricao: `Progresso geral em intervenções ativas: ${progresso.percentual}%`,
        tipo: TipoInsight.DESCRITIVO,
        nivelRisco: this.determinarNivelRiscoIntervencoes(progresso),
        metricas: [
          {
            nome: 'Progresso Geral',
            valor: `${progresso.percentual}%`,
            unidade: 'percentual'
          }
        ],
        recomendacoes: this.gerarRecomendacoesIntervencoes(progresso)
      });
    }

    // Análise preditiva de risco
    if (historico.length > 0) {
      const previsao = await this.gerarPrevisaoRisco(historico, avaliacoes, intervencoes);

      insights.push({
        titulo: 'Previsão de Risco Acadêmico',
        descricao: `Probabilidade de risco: ${previsao.probabilidade}%`,
        tipo: TipoInsight.PREDITIVO,
        nivelRisco: this.determinarNivelRiscoPrevisao(previsao),
        metricas: [
          {
            nome: 'Probabilidade de Risco',
            valor: `${previsao.probabilidade}%`,
            unidade: 'percentual'
          }
        ],
        recomendacoes: previsao.recomendacoes
      });
    }

    return insights;
  }

  private calcularTendencia(valores: number[]): string {
    if (valores.length < 2) return 'INDEFINIDA';

    const ultimosValores = valores.slice(0, 3);
    const media = ultimosValores.reduce((acc, curr) => acc + curr, 0) / ultimosValores.length;
    const desvioPadrao = Math.sqrt(
      ultimosValores.reduce((acc, curr) => acc + Math.pow(curr - media, 2), 0) / ultimosValores.length
    );

    if (desvioPadrao < 0.5) return 'ESTÁVEL';
    if (ultimosValores[0] > media) return 'CRESCENTE';
    if (ultimosValores[0] < media) return 'DECRESCENTE';
    return 'FLUTUANTE';
  }

  private determinarNivelRisco(media: number, tendencia: string): NivelRisco {
    if (media < 5) return NivelRisco.MUITO_ALTO;
    if (media < 6) return NivelRisco.ALTO;
    if (media < 7) return NivelRisco.MODERADO;
    if (tendencia === 'DECRESCENTE') return NivelRisco.MODERADO;
    return NivelRisco.BAIXO;
  }

  private async analisarProgressoIntervencoes(intervencoes: any[]) {
    // Implementar lógica de análise de progresso
    return {
      percentual: 75,
      detalhes: 'Progresso geral positivo'
    };
  }

  private determinarNivelRiscoIntervencoes(progresso: any): NivelRisco {
    if (progresso.percentual < 30) return NivelRisco.MUITO_ALTO;
    if (progresso.percentual < 50) return NivelRisco.ALTO;
    if (progresso.percentual < 70) return NivelRisco.MODERADO;
    return NivelRisco.BAIXO;
  }

  private async gerarPrevisaoRisco(
    historico: any[],
    avaliacoes: any[],
    intervencoes: any[]
  ): Promise<{
    probabilidade: number;
    recomendacoes: any[];
  }> {
    // Implementar lógica de previsão de risco
    return {
      probabilidade: 65,
      recomendacoes: [
        {
          descricao: 'Implementar intervenções específicas para áreas de dificuldade',
          prioridade: '3',
          impacto: 'ALTO'
        }
      ]
    };
  }

  private determinarNivelRiscoPrevisao(previsao: any): NivelRisco {
    if (previsao.probabilidade > 80) return NivelRisco.MUITO_ALTO;
    if (previsao.probabilidade > 60) return NivelRisco.ALTO;
    if (previsao.probabilidade > 40) return NivelRisco.MODERADO;
    return NivelRisco.BAIXO;
  }

  private gerarRecomendacoesDesempenho(media: number, tendencia: string): any[] {
    const recomendacoes: any[] = [];

    if (media < 6) {
      recomendacoes.push({
        descricao: 'Implementar reforço escolar nas áreas com menor desempenho',
        prioridade: '4',
        impacto: 'ALTO'
      });
    }

    if (tendencia === 'DECRESCENTE') {
      recomendacoes.push({
        descricao: 'Realizar avaliação diagnóstica para identificar causas do declínio',
        prioridade: '3',
        impacto: 'MÉDIO'
      });
    }

    return recomendacoes;
  }

  private gerarRecomendacoesIntervencoes(progresso: any): any[] {
    const recomendacoes: any[] = [];

    if (progresso.percentual < 50) {
      recomendacoes.push({
        descricao: 'Revisar e ajustar estratégias de intervenção',
        prioridade: '4',
        impacto: 'ALTO'
      });
    }

    return recomendacoes;
  }

  private validateInsightData(dto: CreateInsightDto | UpdateInsightDto) {
    if (dto.metricas) {
      dto.metricas.forEach(metrica => {
        if (!metrica.nome || !metrica.valor || !metrica.unidade) {
          throw new BadRequestException('Métricas devem conter nome, valor e unidade');
        }
      });
    }

    if (dto.recomendacoes) {
      dto.recomendacoes.forEach(recomendacao => {
        if (!recomendacao.descricao || !recomendacao.prioridade || !recomendacao.impacto) {
          throw new BadRequestException('Recomendações devem conter descrição, prioridade e impacto');
        }
      });
    }
  }
} 