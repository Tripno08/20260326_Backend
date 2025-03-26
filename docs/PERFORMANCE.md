# Performance e Otimização - Innerview Backend

## Visão Geral

O Innerview Backend implementa diversas estratégias de otimização para garantir alta performance e escalabilidade, mesmo com grandes volumes de dados educacionais.

## Cache

### 1. Cache em Redis
```typescript
@Injectable()
export class CacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 2. Cache de Consultas
```typescript
@Injectable()
export class QueryCacheService {
  constructor(
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  async getCachedQuery<T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await query();
    await this.cache.set(key, result, ttl);
    return result;
  }
}
```

## Otimização de Banco de Dados

### 1. Índices Otimizados
```sql
-- Índices para consultas frequentes
CREATE INDEX idx_users_email ON usuarios(email);
CREATE INDEX idx_students_instituicao ON estudantes(instituicaoId);
CREATE INDEX idx_interventions_status ON intervencoes(status);
CREATE INDEX idx_assessments_date ON avaliacoes(data);
```

### 2. Data Loaders
```typescript
@Injectable()
export class DataLoaderService {
  private loaders: Map<string, DataLoader<any, any>> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  getLoader<T>(key: string, batchFn: (ids: string[]) => Promise<T[]>): DataLoader<string, T> {
    if (!this.loaders.has(key)) {
      this.loaders.set(key, new DataLoader(batchFn));
    }
    return this.loaders.get(key);
  }

  clearAll(): void {
    this.loaders.forEach(loader => loader.clearAll());
    this.loaders.clear();
  }
}
```

### 3. Queries Otimizadas
```typescript
@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataLoader: DataLoaderService,
  ) {}

  async findWithInterventions(id: string): Promise<Student> {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        interventions: {
          where: { status: 'ATIVO' },
          include: {
            progressos: {
              orderBy: { data: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
  }
}
```

## Compressão e Otimização de Respostas

### 1. Compressão HTTP
```typescript
@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (this.shouldCompress(request)) {
      response.setHeader('Content-Encoding', 'gzip');
    }

    return next.handle();
  }

  private shouldCompress(request: Request): boolean {
    const acceptEncoding = request.headers['accept-encoding'];
    return acceptEncoding?.includes('gzip') || false;
  }
}
```

### 2. Otimização de Payload
```typescript
@Injectable()
export class ResponseOptimizerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.optimizeResponse(data)),
    );
  }

  private optimizeResponse(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.optimizeItem(item));
    }
    return this.optimizeItem(data);
  }

  private optimizeItem(item: any): any {
    const optimized: any = {};
    for (const [key, value] of Object.entries(item)) {
      if (value !== null && value !== undefined) {
        optimized[key] = value;
      }
    }
    return optimized;
  }
}
```

## Rate Limiting e Proteção

### 1. Rate Limiting
```typescript
@Injectable()
export class RateLimitService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    return current <= limit;
  }
}
```

### 2. Circuit Breaker
```typescript
@Injectable()
export class CircuitBreakerService {
  private failures: Map<string, number> = new Map();
  private lastFailure: Map<string, Date> = new Map();

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    threshold: number = 5,
    resetTimeout: number = 60000,
  ): Promise<T> {
    if (this.isOpen(key, threshold, resetTimeout)) {
      throw new CircuitBreakerException('Circuit breaker is open');
    }

    try {
      const result = await operation();
      this.reset(key);
      return result;
    } catch (error) {
      this.recordFailure(key);
      throw error;
    }
  }

  private isOpen(key: string, threshold: number, resetTimeout: number): boolean {
    const failures = this.failures.get(key) || 0;
    const lastFailure = this.lastFailure.get(key);

    if (failures >= threshold) {
      if (lastFailure && Date.now() - lastFailure.getTime() < resetTimeout) {
        return true;
      }
      this.reset(key);
    }

    return false;
  }
}
```

## Monitoramento de Performance

### 1. Métricas
```typescript
@Injectable()
export class PerformanceMetricsService {
  constructor(private readonly prometheus: PrometheusService) {}

  recordResponseTime(endpoint: string, duration: number): void {
    this.prometheus.recordHistogram('http_request_duration_seconds', duration, {
      endpoint,
    });
  }

  recordDatabaseQueryTime(query: string, duration: number): void {
    this.prometheus.recordHistogram('database_query_duration_seconds', duration, {
      query,
    });
  }

  recordCacheHitRate(hits: number, misses: number): void {
    const total = hits + misses;
    const rate = total > 0 ? hits / total : 0;
    this.prometheus.recordGauge('cache_hit_rate', rate);
  }
}
```

### 2. Logs de Performance
```typescript
interface IPerformanceLog {
  timestamp: Date;
  operation: string;
  duration: number;
  resource: string;
  metadata: Record<string, any>;
}

@Injectable()
export class PerformanceLoggingService {
  constructor(private readonly logger: LoggerService) {}

  logPerformance(log: IPerformanceLog): void {
    this.logger.info('Performance Log', {
      ...log,
      timestamp: log.timestamp.toISOString(),
    });
  }
}
```

## Otimização de Recursos

### 1. Pool de Conexões
```typescript
@Injectable()
export class DatabasePoolService {
  private pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool({
      max: this.config.get('database.maxConnections'),
      idleTimeoutMillis: this.config.get('database.idleTimeout'),
      connectionTimeoutMillis: this.config.get('database.connectionTimeout'),
    });
  }

  async getConnection(): Promise<Connection> {
    return this.pool.connect();
  }

  async releaseConnection(connection: Connection): Promise<void> {
    connection.release();
  }
}
```

### 2. Gerenciamento de Memória
```typescript
@Injectable()
export class MemoryManagerService {
  private readonly maxMemoryUsage: number;

  constructor(private readonly config: ConfigService) {
    this.maxMemoryUsage = this.config.get('memory.maxUsage');
  }

  checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    if (usage.heapUsed > this.maxMemoryUsage) {
      global.gc?.();
    }
  }
}
```

## Estratégias de Escalabilidade

### 1. Sharding
```typescript
@Injectable()
export class ShardingService {
  constructor(private readonly config: ConfigService) {}

  getShardKey(id: string): string {
    const shardCount = this.config.get('database.shardCount');
    const hash = this.hashString(id);
    return `shard_${hash % shardCount}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
```

### 2. Load Balancing
```typescript
@Injectable()
export class LoadBalancerService {
  private servers: Server[] = [];
  private currentIndex = 0;

  addServer(server: Server): void {
    this.servers.push(server);
  }

  getNextServer(): Server {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }
}
```

## Recomendações de Otimização

### 1. Consultas
- Use índices apropriados
- Evite N+1 queries
- Implemente paginação
- Otimize joins

### 2. Cache
- Cache dados frequentemente acessados
- Implemente cache em camadas
- Use cache distribuído
- Gerencie invalidação

### 3. Recursos
- Monitore uso de memória
- Gerencie conexões
- Implemente timeouts
- Use pools de recursos

### 4. Código
- Otimize loops
- Reduza alocações
- Use streams para grandes dados
- Implemente lazy loading 