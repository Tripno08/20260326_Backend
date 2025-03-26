# Innerview Backend

Backend do projeto Innerview, desenvolvido com NestJS.

## Requisitos

- Node.js 18+
- PostgreSQL
- Redis
- Docker (opcional)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/innerview-backend.git
cd innerview-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

5. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

## Cache Redis

O projeto utiliza Redis para cache de dados, melhorando a performance das requisições. O cache é configurado com as seguintes características:

- TTL padrão: 1 hora
- Cache por usuário
- Invalidação automática em atualizações
- Compressão de dados
- Tratamento de erros

### Configuração do Redis

As configurações do Redis podem ser ajustadas no arquivo `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600
```

### Uso do Cache

O cache é aplicado automaticamente através de interceptors e decorators:

```typescript
@Cache({ ttl: 3600 }) // Cache por 1 hora
async getStudent(id: string) {
  // ...
}

@InvalidateCache('students:*') // Invalida cache ao atualizar
async updateStudent(id: string, data: UpdateStudentDto) {
  // ...
}
```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run start:dev
```

## Testes

Para executar os testes:

```bash
# Testes unitários
npm test

# Testes e2e
npm run test:e2e
```

## Documentação

A documentação da API está disponível em `/api` quando o servidor está rodando.

## Licença

Este projeto está sob a licença MIT. 