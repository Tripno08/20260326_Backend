# Integrações - Innerview Backend

## Visão Geral

O Innerview Backend implementa diversas integrações com sistemas externos para fornecer uma experiência completa e integrada para usuários educacionais.

## Learning Tools Interoperability (LTI)

### 1. Configuração LTI
```typescript
interface ILtiConfig {
  clientId: string;
  clientSecret: string;
  deploymentId: string;
  issuer: string;
  authLoginUrl: string;
  tokenUrl: string;
  keysetUrl: string;
}

@Injectable()
export class LtiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async validateLaunch(launchData: any): Promise<boolean> {
    const nonce = launchData.nonce;
    const timestamp = parseInt(launchData.iat);

    // Validar timestamp
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return false;
    }

    // Validar nonce
    const existingNonce = await this.prisma.ltiNonce.findUnique({
      where: { nonce },
    });

    if (existingNonce) {
      return false;
    }

    await this.prisma.ltiNonce.create({
      data: { nonce, timestamp },
    });

    return true;
  }
}
```

### 2. Deep Linking
```typescript
@Injectable()
export class LtiDeepLinkingService {
  constructor(private readonly config: ConfigService) {}

  async createDeepLink(
    contentItems: ContentItem[],
    returnUrl: string,
  ): Promise<string> {
    const jwt = await this.createJwt(contentItems, returnUrl);
    return `${returnUrl}?jwt=${jwt}`;
  }

  private async createJwt(
    contentItems: ContentItem[],
    returnUrl: string,
  ): Promise<string> {
    const payload = {
      iss: this.config.get('lti.issuer'),
      aud: this.config.get('lti.clientId'),
      exp: Date.now() + 3600,
      iat: Date.now(),
      nonce: this.generateNonce(),
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
      'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {
        deep_link_return_url: returnUrl,
        accept_types: ['link', 'file', 'html', 'ltiResourceLink'],
        accept_presentation_document_targets: ['iframe', 'window'],
      },
    };

    return this.signJwt(payload);
  }
}
```

## Microsoft Education

### 1. Autenticação Microsoft
```typescript
@Injectable()
export class MicrosoftAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const response = await this.httpService.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        client_id: this.config.get('microsoft.clientId'),
        client_secret: this.config.get('microsoft.clientSecret'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.get('microsoft.redirectUri'),
      },
    );

    return response.data.access_token;
  }
}
```

### 2. Sincronização com Teams
```typescript
@Injectable()
export class MicrosoftTeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly microsoftAuth: MicrosoftAuthService,
  ) {}

  async syncTeams(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { microsoftCredential: true },
    });

    if (!user?.microsoftCredential) {
      throw new Error('Credenciais Microsoft não encontradas');
    }

    const teams = await this.getTeams(user.microsoftCredential.accessToken);
    await this.updateTeams(userId, teams);
  }

  private async getTeams(accessToken: string): Promise<Team[]> {
    const response = await this.httpService.get(
      'https://graph.microsoft.com/v1.0/me/joinedTeams',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return response.data.value;
  }
}
```

## Google Classroom

### 1. Autenticação Google
```typescript
@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const response = await this.httpService.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.config.get('google.clientId'),
        client_secret: this.config.get('google.clientSecret'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.get('google.redirectUri'),
      },
    );

    return response.data.access_token;
  }
}
```

### 2. Sincronização de Turmas
```typescript
@Injectable()
export class GoogleClassroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleAuth: GoogleAuthService,
  ) {}

  async syncClasses(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { googleCredential: true },
    });

    if (!user?.googleCredential) {
      throw new Error('Credenciais Google não encontradas');
    }

    const classes = await this.getClasses(user.googleCredential.accessToken);
    await this.updateClasses(userId, classes);
  }

  private async getClasses(accessToken: string): Promise<Classroom[]> {
    const response = await this.httpService.get(
      'https://classroom.googleapis.com/v1/courses',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return response.data.courses;
  }
}
```

## Webhooks

### 1. Gerenciamento de Webhooks
```typescript
@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async registerWebhook(config: WebhookConfig): Promise<Webhook> {
    const webhook = await this.prisma.webhook.create({
      data: {
        url: config.url,
        events: config.events,
        secret: this.generateSecret(),
        active: true,
      },
    });

    return webhook;
  }

  async triggerWebhook(event: string, payload: any): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        active: true,
        events: { has: event },
      },
    });

    await Promise.all(
      webhooks.map(webhook =>
        this.sendWebhook(webhook, event, payload),
      ),
    );
  }

  private async sendWebhook(
    webhook: Webhook,
    event: string,
    payload: any,
  ): Promise<void> {
    const signature = this.generateSignature(
      webhook.secret,
      JSON.stringify(payload),
    );

    await this.httpService.post(webhook.url, payload, {
      headers: {
        'X-Webhook-Event': event,
        'X-Webhook-Signature': signature,
      },
    });
  }
}
```

### 2. Validação de Webhooks
```typescript
@Injectable()
export class WebhookValidationService {
  validateSignature(
    signature: string,
    payload: string,
    secret: string,
  ): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return signature === expectedSignature;
  }

  private generateSignature(secret: string, payload: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
}
```

## Integração com APIs REST

### 1. Cliente HTTP
```typescript
@Injectable()
export class ApiClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async request<T>(
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.httpService.request({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: this.config.get('api.timeout'),
    });

    return response.data;
  }
}
```

### 2. Retry e Circuit Breaker
```typescript
@Injectable()
export class ApiRetryService {
  constructor(
    private readonly apiClient: ApiClientService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async requestWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.circuitBreaker.execute(
          `api_request_${i}`,
          operation,
        );
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError;
  }
}
```

## Sincronização de Dados

### 1. Sincronização de Usuários
```typescript
@Injectable()
export class UserSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly microsoftTeams: MicrosoftTeamsService,
    private readonly googleClassroom: GoogleClassroomService,
  ) {}

  async syncUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        microsoftCredential: true,
        googleCredential: true,
      },
    });

    if (user.microsoftCredential) {
      await this.microsoftTeams.syncTeams(userId);
    }

    if (user.googleCredential) {
      await this.googleClassroom.syncClasses(userId);
    }
  }
}
```

### 2. Sincronização de Turmas
```typescript
@Injectable()
export class ClassSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly microsoftTeams: MicrosoftTeamsService,
    private readonly googleClassroom: GoogleClassroomService,
  ) {}

  async syncClass(classId: string): Promise<void> {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        microsoftTeam: true,
        googleClassroom: true,
      },
    });

    if (classData.microsoftTeam) {
      await this.syncMicrosoftTeam(classData);
    }

    if (classData.googleClassroom) {
      await this.syncGoogleClassroom(classData);
    }
  }
}
```

## Monitoramento de Integrações

### 1. Logs de Integração
```typescript
interface IIntegrationLog {
  timestamp: Date;
  integration: string;
  operation: string;
  status: 'success' | 'error';
  details: Record<string, any>;
}

@Injectable()
export class IntegrationLoggingService {
  constructor(private readonly logger: LoggerService) {}

  logIntegration(log: IIntegrationLog): void {
    this.logger.info('Integration Log', {
      ...log,
      timestamp: log.timestamp.toISOString(),
    });
  }
}
```

### 2. Métricas de Integração
```typescript
@Injectable()
export class IntegrationMetricsService {
  constructor(private readonly prometheus: PrometheusService) {}

  recordIntegrationCall(
    integration: string,
    operation: string,
    duration: number,
    success: boolean,
  ): void {
    this.prometheus.recordHistogram(
      'integration_request_duration_seconds',
      duration,
      { integration, operation },
    );

    this.prometheus.recordCounter(
      'integration_requests_total',
      1,
      { integration, operation, status: success ? 'success' : 'error' },
    );
  }
}
```

## Tratamento de Erros

### 1. Erros de Integração
```typescript
export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly integration: string,
    public readonly operation: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

@Injectable()
export class IntegrationErrorHandler {
  handleError(error: IntegrationError): void {
    // Log do erro
    this.logger.error('Integration Error', {
      integration: error.integration,
      operation: error.operation,
      message: error.message,
      details: error.details,
    });

    // Notificação
    this.notificationService.notify({
      type: 'integration_error',
      integration: error.integration,
      message: error.message,
    });
  }
}
```

### 2. Retry Policies
```typescript
@Injectable()
export class IntegrationRetryPolicy {
  constructor(private readonly config: ConfigService) {}

  shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.config.get('integration.maxRetries')) {
      return false;
    }

    if (error instanceof NetworkError) {
      return true;
    }

    if (error instanceof RateLimitError) {
      return true;
    }

    return false;
  }

  getDelay(attempt: number): number {
    return Math.min(
      1000 * Math.pow(2, attempt),
      this.config.get('integration.maxDelay'),
    );
  }
}
``` 