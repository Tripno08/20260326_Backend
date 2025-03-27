import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

// Constante para a chave de metadados de auditoria
export const AUDIT_KEY = 'audit';

// Interface para as opções de auditoria
export interface AuditOptions {
  entidade: string;
  acao: string;
  // Se o ID da entidade deve ser extraído automaticamente dos parâmetros ou do resultado
  extrairIdEntidade?: boolean | string;
  // Se os detalhes da auditoria devem incluir os parâmetros da requisição
  incluirParametros?: boolean;
  // Se os detalhes da auditoria devem incluir o resultado da operação
  incluirResultado?: boolean;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get(AUDIT_KEY, context.getHandler());
    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        const { acao, entidade } = auditMetadata;
        const entidadeId = this.getEntidadeId(request, result);
        const detalhes = this.getDetalhes(request, result);

        await this.auditService.registrarAcao(
          request?.user?.id || 'system',
          acao,
          entidade,
          entidadeId,
          detalhes,
        );
      }),
    );
  }

  private getEntidadeId(request: any, result: any): string | undefined {
    // Tenta obter o ID da entidade da URL
    const urlId = request.params.id;
    if (urlId) {
      return urlId;
    }

    // Tenta obter o ID do resultado
    if (result?.id) {
      return result.id;
    }

    return undefined;
  }

  private getDetalhes(request: any, result: any): string | undefined {
    const detalhes: any = {};

    // Adiciona detalhes do corpo da requisição
    if (request.body) {
      detalhes.body = request.body;
    }

    // Adiciona detalhes do resultado
    if (result) {
      detalhes.result = result;
    }

    return Object.keys(detalhes).length > 0 ? JSON.stringify(detalhes) : undefined;
  }
} 