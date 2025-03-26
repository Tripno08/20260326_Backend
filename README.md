# Innerview Backend

Backend do projeto Innerview, uma plataforma educacional com foco em intervenções RTI/MTSS, análises preditivas e integrações com sistemas educacionais.

## Visão Geral

O Innerview Backend é um sistema completo de API RESTful para gestão educacional, desenvolvido com NestJS, TypeScript e Prisma ORM. O projeto oferece uma ampla gama de recursos para instituições educacionais, incluindo:

- Framework RTI/MTSS para intervenções educacionais
- Monitoramento de progresso e avaliações
- Análise preditiva e insights acionáveis
- Integrações com plataformas educacionais (Microsoft Education, Google Classroom, LTI)
- Gestão de equipes multidisciplinares e colaboração
- Relatórios e comunicação com famílias
- Suporte para experiência mobile e de campo

## Tecnologias

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Containerização**: Docker
- **Documentação**: Swagger/OpenAPI
- **Autenticação**: JWT, MFA

## Módulos Implementados

O projeto está organizado de forma modular, com os seguintes componentes:

- **Auth**: Autenticação, autorização e MFA
- **Users**: Gestão de usuários e permissões
- **Students**: Gestão de estudantes e dados educacionais
- **Institutions**: Gestão de instituições educacionais
- **Interventions**: Framework RTI/MTSS e intervenções
- **Assessments**: Rastreios e avaliações
- **Goals**: Metas educacionais e monitoramento
- **Teams**: Equipes multidisciplinares e colaboração
- **Insights**: Análises preditivas e insights
- **Integrations**: Integrações com sistemas externos

## Requisitos

- Node.js 18+
- PostgreSQL
- Redis
- Docker (opcional)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Tripno08/20260326_Backend.git
cd 20260326_Backend
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

## Scripts Úteis

- `start-dev.sh`: Inicia o ambiente de desenvolvimento com hot reload
- `setup-prisma.sh`: Configura o cliente Prisma e executa migrações
- `start.sh`: Inicia o servidor em modo de produção

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run start:dev
# ou
./start-dev.sh
```

## Testes

O projeto inclui uma suíte completa de testes:

```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Testes e2e
npm run test:e2e

# Testes de performance
npm run test:performance

# Testes de segurança
npm run test:security
```

## Documentação da API

A API é totalmente documentada com Swagger. Quando o servidor estiver em execução, acesse:

```
http://localhost:3000/api/docs
```

A documentação inclui todos os endpoints, parâmetros, respostas e modelos de dados.

### Principais Endpoints

- **Auth**: `/api/v1/auth`
- **Users**: `/api/v1/users`
- **Students**: `/api/v1/students`
- **Institutions**: `/api/v1/institutions`
- **Interventions**: `/api/v1/interventions`
- **Assessments**: `/api/v1/assessments`
- **Goals**: `/api/v1/metas`
- **Teams**: `/api/v1/teams`
- **Insights**: `/api/v1/insights`
- **Integrations**: `/api/v1/integrations`
- **Health**: `/api/v1/health`
- **Security**: `/api/v1/security`

Para mais detalhes, consulte a documentação completa em [docs/API.md](docs/API.md).

## Arquitetura

O projeto segue uma arquitetura modular baseada em princípios SOLID, com clara separação de responsabilidades:

- **Controllers**: Responsáveis por receber requisições e retornar respostas
- **Services**: Encapsulam a lógica de negócio
- **DTOs**: Definem estruturas de dados para entrada e saída
- **Módulos Compartilhados**: Funcionalities reutilizáveis como cache, auditoria, autenticação

Para mais detalhes sobre a arquitetura, consulte [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Recursos de IA e Análise Preditiva

O backend inclui recursos avançados de IA e análise preditiva:

- Recomendações personalizadas de intervenções
- Modelos de risco acadêmico
- Previsão de resposta a intervenções
- Identificação precoce de dificuldades
- Análise de tendências com projeções

Para mais detalhes, consulte [docs/IA_E_ANALISE.md](docs/IA_E_ANALISE.md).

## Integrações Educacionais

O sistema suporta integrações com principais plataformas educacionais:

- **LTI (Learning Tools Interoperability)**
- **Microsoft Education e Graph API**
- **Google Classroom**
- **API RESTful para integrações customizadas**

Para mais detalhes, consulte [docs/INTEGRACOES.md](docs/INTEGRACOES.md).

## Experiência Mobile e de Campo

O backend possui suporte para uso mobile e em campo:

- APIs otimizadas para dispositivos móveis
- Suporte a operações offline com sincronização
- Ferramentas para trabalho em campo (QR codes, formulários rápidos)
- Compressão e otimização para redes limitadas

Para mais detalhes, consulte [docs/MOBILE_E_CAMPO.md](docs/MOBILE_E_CAMPO.md).

## Licença

Este projeto está sob a licença MIT. 