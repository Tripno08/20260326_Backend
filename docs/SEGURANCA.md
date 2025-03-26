# Segurança - Innerview Backend

## Visão Geral

O Innerview Backend implementa uma abordagem abrangente de segurança, seguindo as melhores práticas da indústria e requisitos específicos para dados educacionais sensíveis.

## Autenticação e Autorização

### 1. Autenticação Multi-Fator
```typescript
interface IAuthConfig {
  mfaEnabled: boolean;
  mfaMethods: MfaMethod[];
  backupCodes: string[];
  lastUsed: Date;
}

enum MfaMethod {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  AUTHENTICATOR = 'AUTHENTICATOR'
}
```

### 2. JWT com Refresh Tokens
```typescript
interface ITokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
```

### 3. RBAC (Role-Based Access Control)
```typescript
interface IPermission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface IRole {
  name: string;
  permissions: IPermission[];
  description?: string;
}
```

## Proteção de Dados

### 1. Criptografia
- Dados em trânsito: TLS 1.3
- Dados em repouso: AES-256
- Senhas: bcrypt com salt único
- Chaves de API: criptografia assimétrica

### 2. Sanitização
```typescript
class DataSanitizer {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .escape();
  }

  static sanitizeOutput(output: any): any {
    return JSON.parse(
      JSON.stringify(output, (key, value) => {
        if (typeof value === 'string') {
          return this.sanitizeInput(value);
        }
        return value;
      })
    );
  }
}
```

### 3. Validação
```typescript
class ValidationPipe extends BaseValidationPipe {
  transform(value: any, metadata: ArgumentMetadata): any {
    const schema = this.getSchema(metadata);
    const result = schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      throw new ValidationException(result.error);
    }

    return result.value;
  }
}
```

## Proteção contra Ataques

### 1. Rate Limiting
```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `rate_limit:${request.ip}`;
    const limit = this.config.get('rateLimit.max');
    const window = this.config.get('rateLimit.window');

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, window);
    }

    return current <= limit;
  }
}
```

### 2. Proteção contra XSS
```typescript
@Injectable()
export class XssGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (body) {
      this.sanitizeObject(body);
    }

    return true;
  }

  private sanitizeObject(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = this.sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObject(obj[key]);
      }
    });
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
```

### 3. Proteção contra CSRF
```typescript
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrf: CsrfService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-csrf-token'];

    if (!token) {
      throw new UnauthorizedException('CSRF token não fornecido');
    }

    return this.csrf.validateToken(token);
  }
}
```

## Auditoria e Logging

### 1. Logs de Segurança
```typescript
interface ISecurityLog {
  timestamp: Date;
  event: SecurityEvent;
  userId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
}

enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  DATA_ACCESS = 'DATA_ACCESS'
}
```

### 2. Auditoria de Ações
```typescript
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(action: AuditAction): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: action.userId,
        action: action.type,
        entity: action.entity,
        entityId: action.entityId,
        details: action.details,
        ip: action.ip,
        userAgent: action.userAgent,
      },
    });
  }
}
```

## Conformidade

### 1. LGPD/GDPR
- Consentimento explícito
- Direito ao esquecimento
- Portabilidade de dados
- Registro de processamento

### 2. Políticas de Segurança
- Política de senhas
- Política de acesso
- Política de backup
- Política de incidentes

### 3. Procedimentos
- Procedimento de recuperação
- Procedimento de backup
- Procedimento de incidentes
- Procedimento de auditoria

## Monitoramento

### 1. Detecção de Ameaças
- Monitoramento de tentativas de login
- Monitoramento de acessos suspeitos
- Monitoramento de alterações de dados
- Monitoramento de performance

### 2. Alertas
- Alertas de segurança
- Alertas de performance
- Alertas de disponibilidade
- Alertas de conformidade

### 3. Relatórios
- Relatórios de segurança
- Relatórios de auditoria
- Relatórios de conformidade
- Relatórios de incidentes

## Incidentes

### 1. Plano de Resposta
- Identificação
- Contenção
- Investigação
- Resolução
- Recuperação

### 2. Comunicação
- Stakeholders
- Usuários
- Autoridades
- Mídia

### 3. Documentação
- Registro de incidentes
- Análise de causa raiz
- Ações corretivas
- Lições aprendidas 