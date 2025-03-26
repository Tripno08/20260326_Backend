# Padrões e Tipos - Innerview Backend

## Padrões de Código

### Estrutura de Arquivos
```
src/
├── modules/                    # Módulos do sistema
│   ├── {nome-modulo}/         # Módulo específico
│   │   ├── dto/              # DTOs do módulo
│   │   ├── entities/         # Entidades do módulo
│   │   ├── interfaces/       # Interfaces do módulo
│   │   ├── services/         # Serviços do módulo
│   │   ├── controllers/      # Controllers do módulo
│   │   └── {nome-modulo}.module.ts
├── shared/                    # Recursos compartilhados
└── config/                    # Configurações
```

### Nomenclatura
- **Classes**: PascalCase (ex: `UserService`)
- **Interfaces**: PascalCase com prefixo 'I' (ex: `IUserRepository`)
- **Variáveis e Métodos**: camelCase (ex: `getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_LOGIN_ATTEMPTS`)
- **Arquivos**: kebab-case (ex: `user-service.ts`)

### Decorators
```typescript
// Controllers
@Controller('users')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)

// Services
@Injectable()
@InjectRepository(User)

// DTOs
@IsString()
@IsNotEmpty()
@MinLength(3)
```

### Respostas da API
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta?: {
    totalCount?: number;
    page?: number;
    perPage?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Tipos e Interfaces

### Usuário
```typescript
interface IUser {
  id: string;
  email: string;
  nome: string;
  cargo: CargoUsuario;
  avatar?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

enum CargoUsuario {
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR',
  ESPECIALISTA = 'ESPECIALISTA',
  COORDENADOR = 'COORDENADOR',
  DIRETOR = 'DIRETOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}
```

### Estudante
```typescript
interface IStudent {
  id: string;
  nome: string;
  serie: string;
  dataNascimento: Date;
  usuarioId: string;
  instituicaoId?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Intervenção
```typescript
interface IIntervention {
  id: string;
  dataInicio: Date;
  dataFim?: Date;
  tipo: string;
  descricao: string;
  status: Status;
  observacoes?: string;
  estudanteId: string;
  intervencaoBaseId?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

enum Status {
  PENDENTE = 'PENDENTE',
  AGENDADO = 'AGENDADO',
  ATIVO = 'ATIVO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}
```

### Avaliação
```typescript
interface IAssessment {
  id: string;
  data: Date;
  tipo: string;
  pontuacao: number;
  observacoes?: string;
  metadados?: Record<string, any>;
  estudanteId: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Equipe
```typescript
interface ITeam {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

interface ITeamMember {
  id: string;
  cargo: CargoEquipe;
  dataEntrada: Date;
  dataSaida?: Date;
  ativo: boolean;
  usuarioId: string;
  equipeId: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

enum CargoEquipe {
  COORDENADOR = 'COORDENADOR',
  ESPECIALISTA = 'ESPECIALISTA',
  PROFESSOR = 'PROFESSOR',
  CONSELHEIRO = 'CONSELHEIRO',
  PSICOLOGO = 'PSICOLOGO',
  OUTRO = 'OUTRO'
}
```

## Padrões de Segurança

### Autenticação
- JWT com refresh tokens
- Autenticação multi-fator
- Rate limiting por IP e usuário
- Bloqueio após tentativas falhas

### Autorização
- RBAC (Role-Based Access Control)
- Permissões baseadas em contexto
- Validação de permissões em nível de recurso

### Validação
- Validação de entrada com class-validator
- Sanitização de dados
- Validação de tipos com TypeScript
- Validação de permissões

## Padrões de Performance

### Cache
- Cache em Redis para dados frequentemente acessados
- Cache de consultas complexas
- Cache de resultados de análise
- Invalidação automática de cache

### Otimização de Consultas
- Uso de índices otimizados
- Data loaders para evitar N+1
- Paginação em todas as listagens
- Filtros eficientes

### Compressão
- Compressão de respostas HTTP
- Compressão de uploads
- Otimização de imagens
- Minificação de assets

## Padrões de Logging

### Estrutura de Logs
```typescript
interface ILogEntry {
  timestamp: Date;
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}
```

### Tipos de Logs
- Logs de aplicação
- Logs de auditoria
- Logs de performance
- Logs de segurança

## Padrões de Testes

### Estrutura de Testes
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Tipos de Testes
- Testes unitários
- Testes de integração
- Testes e2e
- Testes de performance

## Padrões de Documentação

### Swagger/OpenAPI
```typescript
@ApiTags('users')
@ApiOperation({ summary: 'Get user by id' })
@ApiResponse({ status: 200, description: 'User found' })
@ApiResponse({ status: 404, description: 'User not found' })
```

### JSDoc
```typescript
/**
 * Retrieves a user by their ID
 * @param {string} id - The user's ID
 * @returns {Promise<User>} The user object
 * @throws {NotFoundException} If user is not found
 */
async findById(id: string): Promise<User> {
  // Implementation
}
```

## Padrões de Versionamento

### Git
- Commits semânticos
- Branches por feature
- Pull requests com descrição detalhada
- Code review obrigatório

### API
- Versionamento na URL (/api/v1/...)
- Documentação por versão
- Compatibilidade retroativa
- Depreciação gradual 