import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

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

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options); 