# Testes - Innerview Backend

## Visão Geral

O projeto utiliza uma abordagem abrangente para testes, cobrindo diferentes níveis e aspectos da aplicação. A estratégia de testes inclui testes unitários, de integração, e2e e de performance.

## Tipos de Testes

### 1. Testes Unitários
- Testam componentes isolados
- Cobertura de casos de sucesso e erro
- Mocks para dependências externas
- Foco em lógica de negócio

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      nome: 'Test User',
    };

    const user = await service.create(userData);

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.nome).toBe(userData.nome);
    expect(repository.create).toHaveBeenCalledWith(userData);
  });
});
```

### 2. Testes de Integração
- Testam interação entre componentes
- Banco de dados real ou em memória
- Cache e serviços externos
- Fluxos completos

```typescript
describe('UserModule Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should create and retrieve a user', async () => {
    const userData = {
      email: 'test@example.com',
      nome: 'Test User',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(201);

    const user = response.body.data;
    expect(user.email).toBe(userData.email);
    expect(user.nome).toBe(userData.nome);

    const getResponse = await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .expect(200);

    expect(getResponse.body.data).toEqual(user);
  });
});
```

### 3. Testes E2E
- Testam fluxos completos
- Ambiente isolado
- Dados de teste consistentes
- Cenários realistas

```typescript
describe('Authentication Flow', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete login flow', async () => {
    // 1. Register user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        nome: 'Test User',
      })
      .expect(201);

    // 2. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
      })
      .expect(200);

    const { accessToken, refreshToken } = loginResponse.body.data;

    // 3. Access protected route
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 4. Refresh token
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshResponse.body.data.accessToken).toBeDefined();
  });
});
```

### 4. Testes de Performance
- Testes de carga
- Testes de stress
- Testes de endurance
- Métricas de performance

```typescript
describe('Performance Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      request(app.getHttpServer())
        .get('/users')
        .expect(200)
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    const avgResponseTime = (endTime - startTime) / requests.length;
    expect(avgResponseTime).toBeLessThan(300); // 300ms threshold
  });
});
```

## Cobertura de Testes

### 1. Módulos Core
- Users: 95%
- Auth: 98%
- Students: 92%
- Interventions: 90%

### 2. Módulos de Integração
- LTI: 85%
- Microsoft: 88%
- Google: 85%

### 3. Módulos de Análise
- Insights: 82%
- Reports: 85%
- Analytics: 80%

## Ferramentas e Frameworks

### 1. Jest
- Framework principal de testes
- Suporte a TypeScript
- Mocks e spies
- Snapshots

### 2. Supertest
- Testes de HTTP
- Asserções de resposta
- Headers e cookies
- Uploads e downloads

### 3. Prisma
- Testes de banco de dados
- Migrations de teste
- Seeds e fixtures
- Limpeza de dados

### 4. Redis
- Testes de cache
- Mock de Redis
- Limpeza de cache
- Performance

## Boas Práticas

### 1. Organização
- Testes isolados
- Setup e teardown claros
- Dados de teste consistentes
- Nomes descritivos

### 2. Manutenção
- Atualização regular
- Refatoração quando necessário
- Documentação clara
- Cobertura mínima

### 3. Performance
- Testes rápidos
- Paralelização quando possível
- Cache de fixtures
- Limpeza eficiente

## CI/CD

### 1. Pipeline
- Execução automática
- Relatórios de cobertura
- Análise de código
- Deploy condicional

### 2. Ambientes
- Desenvolvimento
- Staging
- Produção
- Isolamento

### 3. Monitoramento
- Tempo de execução
- Taxa de falha
- Cobertura de código
- Tendências

## Documentação

### 1. Testes
- Descrição clara
- Exemplos de uso
- Casos de teste
- Cenários

### 2. Código
- Comentários relevantes
- Documentação inline
- Exemplos de uso
- Referências

### 3. Relatórios
- Cobertura de código
- Performance
- Tendências
- Recomendações