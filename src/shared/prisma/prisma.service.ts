import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Adicionar suporte ao modelo Insight (customizado)
  get customInsight() {
    return {
      create: (params: any) => {
        const { data } = params;
        return this.insightRaw.create({
          data: {
            ...data
          }
        });
      },
      findMany: (params: any) => {
        return this.insightRaw.findMany(params);
      },
      findUnique: (params: any) => {
        return this.insightRaw.findUnique(params);
      },
      update: (params: any) => {
        return this.insightRaw.update(params);
      },
      delete: (params: any) => {
        return this.insightRaw.delete(params);
      }
    };
  }
  
  // Modelo raw para operações diretas no banco de dados
  get insightRaw() {
    return {
      create: async (params: any) => {
        const { data } = params;
        const result = await this.$queryRaw`
          INSERT INTO insights (
            id, titulo, descricao, tipo, nivelRisco, metricas, recomendacoes, createdAt, updatedAt
          ) VALUES (
            UUID(), ${data.titulo}, ${data.descricao}, ${data.tipo}, ${data.nivelRisco}, 
            ${data.metricas}, ${data.recomendacoes}, NOW(), NOW()
          )
        `;
        
        // Buscar o registro recém criado
        const insights = await this.$queryRaw`
          SELECT * FROM insights 
          WHERE titulo = ${data.titulo} 
          ORDER BY createdAt DESC 
          LIMIT 1
        `;
        
        return insights[0];
      },
      findMany: async (params: any) => {
        const { where = {}, orderBy = {} } = params;
        
        // Construir consulta SQL
        let conditions = ['1=1'];
        const values = [];
        
        if (where.tipo) {
          conditions.push(`tipo = ?`);
          values.push(where.tipo);
        }
        
        if (where.nivelRisco) {
          conditions.push(`nivelRisco = ?`);
          values.push(where.nivelRisco);
        }
        
        if (where.createdAt?.gte) {
          conditions.push(`DATE(createdAt) >= ?`);
          values.push(new Date(where.createdAt.gte).toISOString().split('T')[0]);
        }
        
        if (where.createdAt?.lte) {
          conditions.push(`DATE(createdAt) <= ?`);
          values.push(new Date(where.createdAt.lte).toISOString().split('T')[0]);
        }
        
        // Definir ordenação
        let orderClause = '';
        if (orderBy.createdAt === 'desc') {
          orderClause = `ORDER BY createdAt DESC`;
        } else if (orderBy.createdAt === 'asc') {
          orderClause = `ORDER BY createdAt ASC`;
        }
        
        const query = `SELECT * FROM insights WHERE ${conditions.join(' AND ')} ${orderClause}`;
        
        return this.$queryRawUnsafe(query, ...values);
      },
      findUnique: async (params: any) => {
        const { where } = params;
        const insights = await this.$queryRaw`
          SELECT * FROM insights WHERE id = ${where.id}
        ` as any[];
        
        return insights.length > 0 ? insights[0] : null;
      },
      update: async (params: any) => {
        const { where, data } = params;
        
        // Construir consulta SQL
        const setValues = [];
        const values = [];
        
        if (data.titulo) {
          setValues.push(`titulo = ?`);
          values.push(data.titulo);
        }
        
        if (data.descricao) {
          setValues.push(`descricao = ?`);
          values.push(data.descricao);
        }
        
        if (data.tipo) {
          setValues.push(`tipo = ?`);
          values.push(data.tipo);
        }
        
        if (data.nivelRisco) {
          setValues.push(`nivelRisco = ?`);
          values.push(data.nivelRisco);
        }
        
        if (data.metricas) {
          setValues.push(`metricas = ?`);
          values.push(data.metricas);
        }
        
        if (data.recomendacoes) {
          setValues.push(`recomendacoes = ?`);
          values.push(data.recomendacoes);
        }
        
        setValues.push(`updatedAt = NOW()`);
        
        const query = `UPDATE insights SET ${setValues.join(', ')} WHERE id = ?`;
        values.push(where.id);
        
        await this.$queryRawUnsafe(query, ...values);
        
        return this.insightRaw.findUnique({ where });
      },
      delete: async (params: any) => {
        const { where } = params;
        const insight = await this.insightRaw.findUnique({ where });
        
        if (!insight) return null;
        
        await this.$queryRaw`
          DELETE FROM insights WHERE id = ${where.id}
        `;
        
        return insight;
      }
    };
  }
  
  // Modelo auditoria customizado
  get customAuditoria() {
    return {
      create: async (params: any) => {
        const { data } = params;
        await this.$queryRaw`
          INSERT INTO auditoria (id, usuario_id, acao, entidade, entidade_id, detalhes, criado_em)
          VALUES (UUID(), ${data.usuarioId}, ${data.acao}, ${data.entidade}, ${data.entidadeId}, ${data.detalhes ? JSON.stringify(data.detalhes) : null}, NOW())
        `;
        
        // Retornar o registro criado
        const auditorias = await this.$queryRaw`
          SELECT * FROM auditoria 
          WHERE usuario_id = ${data.usuarioId} 
          ORDER BY criado_em DESC 
          LIMIT 1
        ` as any[];
        
        return auditorias[0];
      },
      findMany: async (params: any) => {
        const { where = {}, orderBy = {}, skip = 0, take = 100 } = params;
        let conditions = ['1=1'];
        const values = [];
        
        if (where.usuarioId) {
          conditions.push(`usuario_id = ?`);
          values.push(where.usuarioId);
        }
        
        if (where.entidade) {
          conditions.push(`entidade = ?`);
          values.push(where.entidade);
        }
        
        if (where.entidadeId) {
          conditions.push(`entidade_id = ?`);
          values.push(where.entidadeId);
        }
        
        if (where.acao) {
          conditions.push(`acao = ?`);
          values.push(where.acao);
        }
        
        let orderClause = '';
        if (orderBy.criado_em === 'desc') {
          orderClause = `ORDER BY criado_em DESC`;
        } else if (orderBy.criado_em === 'asc') {
          orderClause = `ORDER BY criado_em ASC`;
        }
        
        const query = `
          SELECT a.*, u.nome as usuario_nome, u.email as usuario_email
          FROM auditoria a
          LEFT JOIN usuario u ON a.usuario_id = u.id
          WHERE ${conditions.join(' AND ')} 
          ${orderClause}
          LIMIT ${take} OFFSET ${skip}
        `;
        
        return this.$queryRawUnsafe(query, ...values);
      },
      count: async (params: any) => {
        const { where = {} } = params;
        let conditions = ['1=1'];
        const values = [];
        
        if (where.usuarioId) {
          conditions.push(`usuario_id = ?`);
          values.push(where.usuarioId);
        }
        
        if (where.entidade) {
          conditions.push(`entidade = ?`);
          values.push(where.entidade);
        }
        
        if (where.entidadeId) {
          conditions.push(`entidade_id = ?`);
          values.push(where.entidadeId);
        }
        
        if (where.acao) {
          conditions.push(`acao = ?`);
          values.push(where.acao);
        }
        
        const query = `
          SELECT COUNT(*) as count
          FROM auditoria
          WHERE ${conditions.join(' AND ')}
        `;
        
        const result = await this.$queryRawUnsafe(query, ...values) as any[];
        return Number(result[0].count);
      },
      deleteMany: async (params: any = {}) => {
        const { where = {} } = params;
        let conditions = ['1=1'];
        const values = [];
        
        if (where.usuarioId) {
          conditions.push(`usuario_id = ?`);
          values.push(where.usuarioId);
        }
        
        if (where.entidade) {
          conditions.push(`entidade = ?`);
          values.push(where.entidade);
        }
        
        const query = `DELETE FROM auditoria WHERE ${conditions.join(' AND ')}`;
        
        return this.$queryRawUnsafe(query, ...values);
      }
    };
  }
  
  // Modelo de log de integração customizado
  get customIntegrationLog() {
    return {
      create: async (params: any) => {
        const { data } = params;
        await this.$queryRaw`
          INSERT INTO integration_logs (id, integration_id, success, error, timestamp)
          VALUES (UUID(), ${data.integrationId}, ${data.success}, ${data.error || null}, NOW())
        `;
        
        // Retornar o registro criado
        const logs = await this.$queryRaw`
          SELECT * FROM integration_logs 
          WHERE integration_id = ${data.integrationId} 
          ORDER BY timestamp DESC 
          LIMIT 1
        ` as any[];
        
        return logs[0];
      },
      findMany: async (params: any) => {
        const { where = {}, orderBy = {}, skip = 0, take = 100 } = params;
        let conditions = ['1=1'];
        const values = [];
        
        if (where.integrationId) {
          conditions.push(`integration_id = ?`);
          values.push(where.integrationId);
        }
        
        if (where.success !== undefined) {
          conditions.push(`success = ?`);
          values.push(where.success);
        }
        
        let orderClause = '';
        if (orderBy.timestamp === 'desc') {
          orderClause = `ORDER BY timestamp DESC`;
        } else if (orderBy.timestamp === 'asc') {
          orderClause = `ORDER BY timestamp ASC`;
        }
        
        const query = `
          SELECT * FROM integration_logs
          WHERE ${conditions.join(' AND ')} 
          ${orderClause}
          LIMIT ${take} OFFSET ${skip}
        `;
        
        return this.$queryRawUnsafe(query, ...values);
      },
      count: async (params: any) => {
        const { where = {} } = params;
        let conditions = ['1=1'];
        const values = [];
        
        if (where.integrationId) {
          conditions.push(`integration_id = ?`);
          values.push(where.integrationId);
        }
        
        if (where.success !== undefined) {
          conditions.push(`success = ?`);
          values.push(where.success);
        }
        
        const query = `
          SELECT COUNT(*) as count
          FROM integration_logs
          WHERE ${conditions.join(' AND ')}
        `;
        
        const result = await this.$queryRawUnsafe(query, ...values) as any[];
        return Number(result[0].count);
      }
    };
  }
} 