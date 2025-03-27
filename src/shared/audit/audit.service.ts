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
    return this.prisma.$queryRaw`
      INSERT INTO auditoria (id, usuario_id, acao, entidade, entidade_id, detalhes, criado_em)
      VALUES (UUID(), ${usuarioId}, ${acao}, ${entidade}, ${entidadeId}, ${detalhes ? JSON.stringify(detalhes) : null}, NOW())
    `;
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
    // Construir consulta SQL
    let conditions = ['1=1'];
    const values = [];
    
    if (filtros) {
      if (filtros.usuarioId) {
        conditions.push(`usuario_id = ?`);
        values.push(filtros.usuarioId);
      }
      
      if (filtros.entidade) {
        conditions.push(`entidade = ?`);
        values.push(filtros.entidade);
      }
      
      if (filtros.entidadeId) {
        conditions.push(`entidade_id = ?`);
        values.push(filtros.entidadeId);
      }
      
      if (filtros.acao) {
        conditions.push(`acao = ?`);
        values.push(filtros.acao);
      }
      
      if (filtros.dataInicio) {
        conditions.push(`DATE(criado_em) >= ?`);
        values.push(new Date(filtros.dataInicio).toISOString().split('T')[0]);
      }
      
      if (filtros.dataFim) {
        conditions.push(`DATE(criado_em) <= ?`);
        values.push(new Date(filtros.dataFim).toISOString().split('T')[0]);
      }
    }
    
    const whereClause = conditions.join(' AND ');
    const limitClause = `LIMIT ${itensPorPagina} OFFSET ${(pagina - 1) * itensPorPagina}`;
    
    // Buscar registros
    const registrosQuery = `
      SELECT a.*, u.nome as usuario_nome, u.email as usuario_email
      FROM auditoria a
      LEFT JOIN usuario u ON a.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY a.criado_em DESC
      ${limitClause}
    `;
    
    // Contar total de registros
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM auditoria
      WHERE ${whereClause}
    `;
    
    const [registros, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(registrosQuery, ...values),
      this.prisma.$queryRawUnsafe(totalQuery, ...values)
    ]);
    
    const total = countResult[0].total;
    
    return {
      dados: this.formatarRegistros(Array.isArray(registros) ? registros : []),
      meta: {
        total,
        pagina,
        itensPorPagina,
        totalPaginas: Math.ceil(total / itensPorPagina),
      },
    };
  }
  
  private formatarRegistros(registros: any[]): any[] {
    return registros.map(reg => ({
      id: reg.id,
      acao: reg.acao,
      entidade: reg.entidade,
      entidadeId: reg.entidade_id,
      detalhes: reg.detalhes ? JSON.parse(reg.detalhes) : null,
      criadoEm: reg.criado_em,
      usuario: reg.usuario_id ? {
        id: reg.usuario_id,
        nome: reg.usuario_nome,
        email: reg.usuario_email
      } : null
    }));
  }
} 