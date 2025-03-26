# Documentação da API - Innerview

## Visão Geral

A API do Innerview é uma API RESTful que fornece endpoints para todas as funcionalidades da plataforma. A documentação completa está disponível via Swagger em `/api/docs`.

## Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para autenticar as requisições:

1. Faça login usando o endpoint `/api/v1/auth/login`
2. Receba o token JWT
3. Inclua o token no header das requisições: `Authorization: Bearer <token>`

### Exemplo de Autenticação

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com", "password": "senha123"}'

# Usar o token
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Endpoints Principais

### Autenticação
- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Logout

### Usuários
- `GET /api/v1/users` - Listar usuários
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users/:id` - Obter usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Remover usuário

### Estudantes
- `GET /api/v1/students` - Listar estudantes
- `POST /api/v1/students` - Criar estudante
- `GET /api/v1/students/:id` - Obter estudante
- `PUT /api/v1/students/:id` - Atualizar estudante
- `DELETE /api/v1/students/:id` - Remover estudante

### Intervenções
- `GET /api/v1/interventions` - Listar intervenções
- `POST /api/v1/interventions` - Criar intervenção
- `GET /api/v1/interventions/:id` - Obter intervenção
- `PUT /api/v1/interventions/:id` - Atualizar intervenção
- `DELETE /api/v1/interventions/:id` - Remover intervenção

### Avaliações
- `GET /api/v1/assessments` - Listar avaliações
- `POST /api/v1/assessments` - Criar avaliação
- `GET /api/v1/assessments/:id` - Obter avaliação
- `PATCH /api/v1/assessments/:id` - Atualizar avaliação
- `DELETE /api/v1/assessments/:id` - Remover avaliação
- `GET /api/v1/assessments/student/:estudanteId` - Buscar avaliações por estudante
- `GET /api/v1/assessments/type/:tipo` - Buscar avaliações por tipo

### Instituições
- `GET /api/v1/institutions` - Listar instituições
- `POST /api/v1/institutions` - Criar instituição
- `GET /api/v1/institutions/:id` - Obter instituição
- `PUT /api/v1/institutions/:id` - Atualizar instituição
- `DELETE /api/v1/institutions/:id` - Remover instituição
- `GET /api/v1/institutions/:id/statistics` - Obter estatísticas da instituição

### Metas
- `GET /api/v1/metas` - Listar metas
- `POST /api/v1/metas` - Criar meta
- `GET /api/v1/metas/:id` - Obter meta
- `PUT /api/v1/metas/:id` - Atualizar meta
- `DELETE /api/v1/metas/:id` - Remover meta
- `POST /api/v1/metas/:id/progresso` - Registrar progresso

### Equipes
- `GET /api/v1/teams` - Listar equipes
- `POST /api/v1/teams` - Criar equipe
- `GET /api/v1/teams/:id` - Obter equipe
- `PUT /api/v1/teams/:id` - Atualizar equipe
- `DELETE /api/v1/teams/:id` - Remover equipe
- `POST /api/v1/teams/:id/members` - Adicionar membro
- `DELETE /api/v1/teams/:id/members/:userId` - Remover membro
- `GET /api/v1/teams/:id/meetings` - Listar reuniões da equipe

### Insights
- `GET /api/v1/insights` - Listar insights disponíveis
- `GET /api/v1/insights/student/:studentId` - Obter insights para estudante
- `GET /api/v1/insights/intervention/:interventionId` - Obter insights para intervenção
- `GET /api/v1/insights/trends` - Obter tendências e análise preditiva
- `GET /api/v1/insights/recommendations` - Obter recomendações personalizadas

### Integrações
- `GET /api/v1/integrations` - Listar integrações disponíveis
- `POST /api/v1/integrations/lti/configure` - Configurar integração LTI
- `GET /api/v1/integrations/lti/status` - Verificar status LTI
- `POST /api/v1/integrations/microsoft/connect` - Conectar Microsoft Education
- `POST /api/v1/integrations/google/authorize` - Autorizar Google Classroom
- `GET /api/v1/integrations/sync/status` - Status da sincronização

### Monitoramento
- `GET /api/v1/monitoring/progress/:studentId` - Monitorar progresso do estudante
- `GET /api/v1/monitoring/interventions` - Monitorar intervenções ativas
- `GET /api/v1/monitoring/metrics` - Obter métricas de desempenho
- `GET /api/v1/monitoring/alerts` - Listar alertas ativos
- `POST /api/v1/monitoring/alerts/acknowledge/:id` - Reconhecer alerta

### Health Checks
- `GET /api/v1/health` - Verificar status geral da API
- `GET /api/v1/health/database` - Verificar status do banco de dados
- `GET /api/v1/health/cache` - Verificar status do cache
- `GET /api/v1/health/services` - Verificar status de serviços externos

### Segurança
- `GET /api/v1/security/audit` - Listar logs de auditoria
- `POST /api/v1/security/scan` - Iniciar verificação de segurança
- `GET /api/v1/security/threats` - Listar ameaças detectadas
- `POST /api/v1/security/threats/:id/mitigate` - Mitigar ameaça específica
- `GET /api/v1/security/settings` - Obter configurações de segurança
- `PATCH /api/v1/security/settings` - Atualizar configurações de segurança

## Respostas

### Formato de Sucesso
```json
{
  "success": true,
  "data": {
    // dados do recurso
  },
  "meta": {
    "totalCount": 100,
    "page": 1,
    "perPage": 20
  },
  "error": null
}
```

### Formato de Erro
```json
{
  "success": false,
  "data": null,
  "meta": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição amigável do erro",
    "details": {
      // detalhes adicionais do erro
    }
  }
}
```

## Códigos de Erro

- `400` - Bad Request: Dados inválidos
- `401` - Unauthorized: Não autenticado
- `403` - Forbidden: Sem permissão
- `404` - Not Found: Recurso não encontrado
- `409` - Conflict: Conflito de dados
- `422` - Unprocessable Entity: Erro de validação
- `500` - Internal Server Error: Erro interno

## Rate Limiting

A API implementa rate limiting para prevenir abusos:
- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## Paginação

Endpoints de listagem suportam paginação:
- `page`: Número da página (default: 1)
- `perPage`: Itens por página (default: 20)
- `sort`: Campo para ordenação
- `order`: Ordem (asc/desc)

## Filtros

Endpoints de listagem suportam filtros:
- `search`: Busca em múltiplos campos
- `status`: Filtrar por status
- `dateRange`: Filtrar por período
- `institution`: Filtrar por instituição

## Exemplos de Uso

### Criar um Estudante
```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "institutionId": "123",
    "grade": "5º ano"
  }'
```

### Listar Intervenções com Filtros
```bash
curl -X GET "http://localhost:3000/api/v1/interventions?page=1&perPage=20&status=active" \
  -H "Authorization: Bearer <token>"
```

### Obter Insights para um Estudante
```bash
curl -X GET "http://localhost:3000/api/v1/insights/student/123" \
  -H "Authorization: Bearer <token>"
```

### Verificar Status das Integrações
```bash
curl -X GET "http://localhost:3000/api/v1/integrations/sync/status" \
  -H "Authorization: Bearer <token>"
```

### Criar uma Nova Equipe
```bash
curl -X POST http://localhost:3000/api/v1/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Equipe de Apoio - 5º Ano",
    "description": "Equipe responsável pelo monitoramento e intervenções do 5º ano",
    "institutionId": "123",
    "members": ["userId1", "userId2", "userId3"]
  }'
```

### Registrar Progresso em uma Meta
```bash
curl -X POST http://localhost:3000/api/v1/metas/456/progresso \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-10-15",
    "value": 75,
    "notes": "Progresso significativo na fluência de leitura"
  }'
```

### Criar uma Nova Avaliação
```bash
curl -X POST http://localhost:3000/api/v1/assessments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "estudanteId": "123",
    "tipo": "TRIAGEM_LEITURA",
    "data": "2023-10-15",
    "pontuacao": 85,
    "observacoes": "Bom desempenho em fluência, dificuldade em compreensão"
  }'
```

### Verificar Saúde da API
```bash
curl -X GET "http://localhost:3000/api/v1/health" \
  -H "Authorization: Bearer <token>"
```

### Verificar Logs de Auditoria
```bash
curl -X GET "http://localhost:3000/api/v1/security/audit?startDate=2023-10-01&endDate=2023-10-15&type=USER_LOGIN" \
  -H "Authorization: Bearer <token>"
```

## Webhooks

A API suporta webhooks para notificações de eventos:
- `POST /api/v1/webhooks` - Registrar webhook
- `GET /api/v1/webhooks` - Listar webhooks
- `DELETE /api/v1/webhooks/:id` - Remover webhook

## Mobile e Experiência de Campo

A API oferece suporte a funcionalidades específicas para uso mobile e em campo:

### Endpoints Principais
- `GET /api/v1/mobile/sync/status` - Status de sincronização offline
- `POST /api/v1/mobile/sync` - Sincronizar dados offline
- `GET /api/v1/mobile/qrcode/:resourceType/:id` - Gerar QR Code para recurso
- `POST /api/v1/mobile/qrcode/scan` - Processar leitura de QR Code
- `GET /api/v1/mobile/dashboard` - Dashboard compacto para dispositivos móveis

### Funcionalidades Offline
A API suporta operações offline com sincronização posterior quando a conexão for restabelecida:

1. **Armazenamento Local**: Dados são armazenados localmente no dispositivo
2. **Sincronização Automática**: Sincronização quando a conexão é restaurada
3. **Resolução de Conflitos**: Sistema inteligente para resolver conflitos de dados
4. **Priorização**: Sincronização priorizada por importância dos dados

### Exemplo de Sincronização Offline

```bash
# Verificar status de sincronização
curl -X GET "http://localhost:3000/api/v1/mobile/sync/status" \
  -H "Authorization: Bearer <token>"

# Enviar dados acumulados offline
curl -X POST "http://localhost:3000/api/v1/mobile/sync" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "observations": [
      {
        "studentId": "123",
        "text": "Observação feita offline",
        "timestamp": "2023-10-15T14:32:00Z"
      }
    ],
    "interventionProgress": [
      {
        "interventionId": "456",
        "status": "completed",
        "notes": "Concluído durante visita",
        "timestamp": "2023-10-15T15:20:00Z"
      }
    ]
  }'
```

### Otimização para Redes Limitadas
A API é otimizada para uso em condições de conectividade limitada:

- Payloads reduzidos e adaptativos
- Compressão de dados 
- Respostas priorizadas por importância
- Suporte para diferentes resoluções de tela

## Suporte

Para suporte técnico:
- Email: suporte@innerview.com
- Documentação: https://docs.innerview.com
- Status da API: https://status.innerview.com

## IA e Análise Preditiva

A API oferece recursos avançados de IA e análise preditiva para gerar insights educacionais:

### Endpoints de IA
- `GET /api/v1/ai/recommendations/students/:studentId` - Recomendações personalizadas para estudante
- `GET /api/v1/ai/recommendations/groups` - Sugestões de agrupamento por necessidades similares
- `GET /api/v1/ai/predictions/risk/:studentId` - Modelo de risco acadêmico
- `GET /api/v1/ai/predictions/interventions/:studentId` - Previsão de resposta a intervenções
- `GET /api/v1/ai/trends/institution/:institutionId` - Análise de tendências com projeções

### Exemplo de Obtenção de Recomendações

```bash
# Obter recomendações para um estudante específico
curl -X GET "http://localhost:3000/api/v1/ai/recommendations/students/123" \
  -H "Authorization: Bearer <token>"

# Resposta
{
  "success": true,
  "data": {
    "interventions": [
      {
        "id": "int-456",
        "title": "Programa de fluência em leitura",
        "confidence": 0.89,
        "rationale": "Baseado no padrão de dificuldades e nos resultados de avaliações recentes"
      },
      {
        "id": "int-789",
        "title": "Atividades em grupo para compreensão textual",
        "confidence": 0.76,
        "rationale": "Melhores resultados em atividades colaborativas"
      }
    ],
    "resources": [
      {
        "id": "res-123",
        "title": "Atividades estruturadas de leitura",
        "type": "material",
        "relevance": 0.91
      }
    ],
    "groups": [
      {
        "id": "group-234",
        "description": "Grupo de intervenção em leitura - Nível 2",
        "fit": 0.85
      }
    ]
  },
  "meta": {},
  "error": null
}
```

### Análise Preditiva de Risco

```bash
# Obter análise de risco acadêmico
curl -X GET "http://localhost:3000/api/v1/ai/predictions/risk/123" \
  -H "Authorization: Bearer <token>"

# Resposta
{
  "success": true,
  "data": {
    "riskLevel": "medio",
    "score": 0.65,
    "factors": [
      {
        "factor": "attendance",
        "contribution": 0.4,
        "description": "Frequência abaixo da média nos últimos 30 dias"
      },
      {
        "factor": "assessment_scores",
        "contribution": 0.35,
        "description": "Queda no desempenho em avaliações de leitura"
      },
      {
        "factor": "engagement",
        "contribution": 0.25,
        "description": "Baixo engajamento em atividades de leitura"
      }
    ],
    "trends": {
      "direction": "improving",
      "confidence": 0.72
    },
    "recommendations": [
      "Monitoramento mais frequente da frequência",
      "Intervenção focada em fluência de leitura",
      "Envolvimento da família no processo"
    ]
  },
  "meta": {},
  "error": null
}
```

## Integrações Educacionais

A API oferece integrações com os principais sistemas e plataformas educacionais:

### Learning Tools Interoperability (LTI)
- `POST /api/v1/integrations/lti/configure` - Configurar provedor LTI
- `GET /api/v1/integrations/lti/status` - Status da integração LTI
- `GET /api/v1/integrations/lti/tools` - Listar ferramentas LTI disponíveis
- `POST /api/v1/integrations/lti/launch` - Endpoint de lançamento LTI

### Microsoft Education
- `POST /api/v1/integrations/microsoft/auth` - Autenticação com Microsoft Graph
- `GET /api/v1/integrations/microsoft/classes` - Listar classes do Microsoft Teams
- `POST /api/v1/integrations/microsoft/sync/students` - Sincronizar estudantes
- `POST /api/v1/integrations/microsoft/sync/assignments` - Sincronizar atribuições

### Google Classroom
- `POST /api/v1/integrations/google/auth` - Autenticação OAuth com Google
- `GET /api/v1/integrations/google/courses` - Listar cursos do Google Classroom
- `POST /api/v1/integrations/google/sync/students` - Sincronizar estudantes
- `POST /api/v1/integrations/google/sync/coursework` - Sincronizar trabalhos do curso

### Exemplo de Configuração LTI

```bash
# Configurar integração LTI
curl -X POST "http://localhost:3000/api/v1/integrations/lti/configure" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "consumer_key": "lti_consumer_key",
    "shared_secret": "shared_secret_value",
    "tool_name": "Innerview RTI/MTSS",
    "description": "Plataforma de monitoramento e intervenções educacionais",
    "launch_url": "https://app.innerview.com/lti/launch",
    "icon_url": "https://app.innerview.com/assets/icon.png",
    "privacy_level": "anonymous",
    "institution_id": "123"
  }'
```

### Sincronização com Google Classroom

```bash
# Sincronizar estudantes do Google Classroom
curl -X POST "http://localhost:3000/api/v1/integrations/google/sync/students" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "google_course_id",
    "institution_id": "123",
    "mapping": {
      "email_domain": "escola.edu",
      "default_role": "student"
    }
  }'
```

## Formato de Dados

A API utiliza os seguintes formatos padrão para representação de dados:

### Usuário
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "cargo": "ADMIN | COORDENADOR | PROFESSOR | ESPECIALISTA",
  "active": true,
  "institutionId": "string",
  "phone": "string",
  "lastLogin": "2023-05-12T15:30:00Z",
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-05-12T15:30:00Z"
}
```

### Estudante
```json
{
  "id": "string",
  "name": "string",
  "identifier": "string",
  "dateOfBirth": "2012-03-25",
  "grade": "string",
  "institutionId": "string",
  "active": true,
  "guardians": [
    {
      "id": "string",
      "name": "string",
      "relationship": "string",
      "email": "string",
      "phone": "string"
    }
  ],
  "tags": ["string"],
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-05-12T15:30:00Z"
}
```

### Intervenção
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "tier": 1 | 2 | 3,
  "domain": "string",
  "frequency": "string",
  "duration": "string",
  "startDate": "2023-05-01",
  "endDate": "2023-06-30",
  "status": "PLANNED | ACTIVE | COMPLETED | CANCELED",
  "studentId": "string",
  "responsibleId": "string",
  "progress": [
    {
      "date": "2023-05-15",
      "status": "string",
      "notes": "string",
      "data": {}
    }
  ],
  "institutionId": "string",
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-05-12T15:30:00Z"
}
```

### Instituição
```json
{
  "id": "string",
  "name": "string",
  "identifier": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "type": "string",
  "active": true,
  "settings": {},
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-05-12T15:30:00Z"
}
```

### Equipe
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "institutionId": "string",
  "members": [
    {
      "userId": "string",
      "role": "string"
    }
  ],
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-05-12T15:30:00Z"
}
```

### Meta
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "metric": "string",
  "baseline": 0,
  "target": 0,
  "startDate": "2023-05-01",
  "endDate": "2023-06-30",
  "studentId": "string",
  "interventionId": "string",
  "progress": [
    {
      "date": "2023-05-15",
      "value": 0,
      "notes": "string"
    }
  ],
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-05-12T15:30:00Z"
}
```

## Relações entre Entidades

O diagrama abaixo representa as principais relações entre entidades no sistema:

- **Instituição** (Institution)
  - Contém muitos **Usuários** (Users)
  - Contém muitos **Estudantes** (Students)
  - Contém muitas **Equipes** (Teams)
  
- **Usuário** (User)
  - Pertence a uma **Instituição**
  - Pode ser membro de muitas **Equipes**
  - Pode ser responsável por muitas **Intervenções**
  
- **Estudante** (Student)
  - Pertence a uma **Instituição**
  - Pode ter muitas **Intervenções**
  - Pode ter muitas **Metas**
  - Pode ter muitas **Avaliações**
  
- **Intervenção** (Intervention)
  - Pertence a um **Estudante**
  - Tem um **Usuário** responsável
  - Pode ter muitas **Metas** associadas
  
- **Meta** (Goal)
  - Pode estar associada a um **Estudante**
  - Pode estar associada a uma **Intervenção**
  - Tem progresso registrado ao longo do tempo

## Controle de Versão da API

A API Innerview segue versionamento semântico:

- Endpoints atuais: `/api/v1/...`
- Endpoints experimentais: `/api/experimental/...`
- Endpoints obsoletos (mas ainda suportados): `/api/deprecated/v1/...`

Quando uma nova versão principal for lançada, os endpoints serão atualizados para `/api/v2/...` e a documentação correspondente será atualizada. 